import { z } from 'zod';

const bodySchema = z.object({
  password: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const { password } = await readValidatedBody(event, bodySchema.parse);
  const valid = verifyAdminPassword(password);

  if (!valid) {
    throw createError({ message: 'Falsches Passwort', statusCode: 401 });
  }

  createAdminSession(event);
  return { ok: true };
});
