import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

const bodySchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
  status: z.enum(['queued', 'rejected']),
});

export default defineEventHandler(async (event) => {
  if (!isAdminAuthenticated(event)) {
    throw createError({ message: 'Nicht autorisiert', statusCode: 401 });
  }

  const { ids, status } = await readValidatedBody(event, bodySchema.parse);

  // If queuing, add each to Spotify queue
  if (status === 'queued') {
    const requests = await db.query.songRequests.findMany({
      where: inArray(schema.songRequests.id, ids),
    });

    let queuedCount = 0;
    for (const req of requests) {
      if (req.status !== 'pending')
        continue;
      try {
        await addToQueue(req.spotifyUri);
        await db.update(schema.songRequests)
          .set({ status: 'queued' })
          .where(eq(schema.songRequests.id, req.id));
        queuedCount++;
      }
      catch {
        // Skip failed ones, continue with rest
      }
    }

    return { message: `${queuedCount} Songs zur Queue hinzugefügt`, ok: true };
  }

  // Reject all
  await db.update(schema.songRequests)
    .set({ status })
    .where(inArray(schema.songRequests.id, ids));

  return { message: `${ids.length} Vorschläge abgelehnt`, ok: true };
});
