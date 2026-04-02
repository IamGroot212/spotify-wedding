import { count, eq } from 'drizzle-orm';

export default defineEventHandler(async () => {
  const [total] = await db.select({ count: count() }).from(schema.songRequests);
  const [pending] = await db.select({ count: count() }).from(schema.songRequests).where(eq(schema.songRequests.status, 'pending'));
  const [queued] = await db.select({ count: count() }).from(schema.songRequests).where(eq(schema.songRequests.status, 'queued'));
  const [rejected] = await db.select({ count: count() }).from(schema.songRequests).where(eq(schema.songRequests.status, 'rejected'));

  return {
    pending: pending.count,
    queued: queued.count,
    rejected: rejected.count,
    total: total.count,
  };
});
