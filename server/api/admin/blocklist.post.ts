import { z } from 'zod';

const bodySchema = z.object({
  type: z.enum(['track', 'artist']),
  value: z.string().min(1).max(200),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse);

  const [inserted] = await db.insert(schema.blocklist).values({
    type: body.type,
    value: body.value.toLowerCase(),
  }).returning();

  return { item: inserted };
});
