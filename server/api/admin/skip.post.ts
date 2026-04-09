export default defineEventHandler(async (event) => {
  if (!isAdminAuthenticated(event)) {
    throw createError({ message: 'Nicht autorisiert', statusCode: 401 });
  }

  try {
    await spotifyFetch('/me/player/next', { method: 'POST' });
  }
  catch {
    throw createError({
      message: 'Skip fehlgeschlagen. Ist ein Spotify-Gerät aktiv?',
      statusCode: 502,
    });
  }

  return { ok: true };
});
