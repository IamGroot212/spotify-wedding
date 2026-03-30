import { eq } from 'drizzle-orm';
import { z } from 'zod';

const bodySchema = z.object({
  requestId: z.number().int().positive(),
});

export default defineEventHandler(async (event) => {
  const { requestId } = await readValidatedBody(event, bodySchema.parse);

  const request = await db.query.songRequests.findFirst({
    where: eq(schema.songRequests.id, requestId),
  });

  if (!request) {
    throw createError({ message: 'Vorschlag nicht gefunden', statusCode: 404 });
  }

  try {
    await addToQueue(request.spotifyUri);
  }
  catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Add to queue failed:', msg);
    throw createError({
      message: `Song konnte nicht zur Queue hinzugefügt werden: ${msg}`,
      statusCode: 502,
    });
  }

  await db.update(schema.songRequests)
    .set({ status: 'queued' })
    .where(eq(schema.songRequests.id, requestId));

  return { ok: true };
});
