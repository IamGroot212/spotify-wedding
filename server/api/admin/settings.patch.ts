import { eq } from 'drizzle-orm';
import { z } from 'zod';

const bodySchema = z.object({
  cooldownSeconds: z.number().int().min(0).max(600).optional(),
  duplicateWindowMinutes: z.number().int().min(0).max(1440).optional(),
  explicitFilterEnabled: z.boolean().optional(),
  maxRequestsPerGuest: z.number().int().min(1).max(100).optional(),
  noRepeatsAllNight: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse);

  const [updated] = await db.update(schema.appSettings)
    .set(body)
    .where(eq(schema.appSettings.id, 1))
    .returning();

  return { settings: updated };
});
