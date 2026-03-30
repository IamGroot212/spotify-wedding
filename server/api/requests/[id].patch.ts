import { eq } from 'drizzle-orm';
import { z } from 'zod';

const bodySchema = z.object({
  status: z.enum(['approved', 'rejected', 'queued', 'played']),
});

export default defineEventHandler(async (event) => {
  // Admin-only (enforced by middleware)
  if (!isAdminAuthenticated(event)) {
    throw createError({ message: 'Nicht autorisiert', statusCode: 401 });
  }

  const id = Number(getRouterParam(event, 'id'));
  if (Number.isNaN(id)) {
    throw createError({ message: 'Ungültige ID', statusCode: 400 });
  }

  const body = await readValidatedBody(event, bodySchema.parse);

  const existing = await db.query.songRequests.findFirst({
    where: eq(schema.songRequests.id, id),
  });

  if (!existing) {
    throw createError({ message: 'Vorschlag nicht gefunden', statusCode: 404 });
  }

  // If approving and adding to queue
  if (body.status === 'queued') {
    try {
      await addToQueue(existing.spotifyUri);
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Add to queue failed:', msg);
      throw createError({
        message: `Song konnte nicht zur Queue hinzugefügt werden: ${msg}`,
        statusCode: 502,
      });
    }
  }

  const [updated] = await db.update(schema.songRequests)
    .set({ status: body.status })
    .where(eq(schema.songRequests.id, id))
    .returning();

  return { request: updated };
});
