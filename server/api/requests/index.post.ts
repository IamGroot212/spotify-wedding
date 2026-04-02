import { and, eq, gte } from 'drizzle-orm';
import { z } from 'zod';

const requestSchema = z.object({
  album: z.string().optional(),
  artist: z.string().min(1),
  coverUrl: z.string().url().optional().nullable(),
  guestSessionId: z.string().max(100).optional(),
  requestedBy: z.string().max(50).optional(),
  spotifyTrackId: z.string().min(1),
  spotifyUri: z.string().startsWith('spotify:track:'),
  title: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, requestSchema.parse);

  // Load settings
  const settings = await db.query.appSettings.findFirst();
  const duplicateWindow = settings?.duplicateWindowMinutes ?? 60;

  // Check for duplicates within window
  const windowStart = new Date(Date.now() - duplicateWindow * 60 * 1000);
  const existing = await db.query.songRequests.findFirst({
    where: and(
      eq(schema.songRequests.spotifyTrackId, body.spotifyTrackId),
      gte(schema.songRequests.createdAt, windowStart),
    ),
  });

  if (existing) {
    throw createError({
      message: 'Dieser Song wurde bereits vorgeschlagen.',
      statusCode: 409,
    });
  }

  // Check explicit filter
  if (settings?.explicitFilterEnabled) {
    // We need to verify with Spotify if it's explicit
    try {
      const results = await searchTracks(body.title, 1);
      const track = results.tracks.items.find(t => t.id === body.spotifyTrackId);
      if (track?.explicit) {
        throw createError({
          message: 'Explizite Songs sind momentan nicht erlaubt.',
          statusCode: 422,
        });
      }
    }
    catch (error: unknown) {
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 422) {
        throw error;
      }
      // If search fails, allow the request through
    }
  }

  // Insert request
  const [inserted] = await db.insert(schema.songRequests).values({
    album: body.album || null,
    artist: body.artist,
    coverUrl: body.coverUrl || null,
    guestSessionId: body.guestSessionId || null,
    requestedBy: body.requestedBy || null,
    spotifyTrackId: body.spotifyTrackId,
    spotifyUri: body.spotifyUri,
    status: settings?.requireApproval ? 'pending' : 'approved',
    title: body.title,
  }).returning();

  // Auto-queue if approval not required
  if (!settings?.requireApproval && inserted) {
    try {
      await addToQueue(inserted.spotifyUri);
      await db.update(schema.songRequests)
        .set({ status: 'queued' })
        .where(eq(schema.songRequests.id, inserted.id));
    }
    catch {
      // Queue add failed, keep as approved
    }
  }

  return {
    message: settings?.requireApproval
      ? 'Songvorschlag eingereicht! Warte auf Freigabe.'
      : 'Song wurde zur Warteschlange hinzugefügt!',
    request: inserted,
  };
});
