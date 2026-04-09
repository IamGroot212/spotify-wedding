import { desc } from 'drizzle-orm';

export default defineEventHandler(async () => {
  const items = await db.query.blocklist.findMany({
    orderBy: [desc(schema.blocklist.createdAt)],
  });
  return { items };
});
