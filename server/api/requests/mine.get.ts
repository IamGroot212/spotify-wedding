import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

const querySchema = z.object({
  sessionId: z.string().min(1).max(100),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse);

  const requests = await db.query.songRequests.findMany({
    orderBy: [desc(schema.songRequests.createdAt)],
    where: eq(schema.songRequests.guestSessionId, query.sessionId),
  });

  return {
    requests: requests.map(r => ({
      artist: r.artist,
      coverUrl: r.coverUrl,
      id: r.id,
      status: r.status,
      title: r.title,
    })),
  };
});
