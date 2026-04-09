import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (Number.isNaN(id)) {
    throw createError({ message: 'Ungültige ID', statusCode: 400 });
  }

  await db.delete(schema.blocklist).where(eq(schema.blocklist.id, id));
  return { ok: true };
});
