import { z } from 'zod';

const bodySchema = z.object({
  action: z.enum(['pause', 'play']),
});

export default defineEventHandler(async (event) => {
  if (!isAdminAuthenticated(event)) {
    throw createError({ message: 'Nicht autorisiert', statusCode: 401 });
  }

  const { action } = await readValidatedBody(event, bodySchema.parse);

  try {
    if (action === 'pause') {
      await spotifyFetch('/me/player/pause', { method: 'PUT' });
    }
    else {
      await spotifyFetch('/me/player/play', { method: 'PUT' });
    }
  }
  catch {
    throw createError({
      message: `${action === 'pause' ? 'Pause' : 'Play'} fehlgeschlagen.`,
      statusCode: 502,
    });
  }

  return { ok: true };
});
