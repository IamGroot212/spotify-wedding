import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  status: z.enum(['pending', 'approved', 'rejected', 'queued', 'played', 'all']).optional().default('all'),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse);

  const where = query.status !== 'all'
    ? eq(schema.songRequests.status, query.status)
    : undefined;

  const requests = await db.query.songRequests.findMany({
    limit: query.limit,
    orderBy: [desc(schema.songRequests.createdAt)],
    where,
  });

  return { requests };
});
