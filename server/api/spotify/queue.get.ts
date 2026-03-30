export default defineEventHandler(async () => {
  try {
    const data = await getQueue();

    return {
      queue: (data.queue || []).slice(0, 20).map(track => ({
        album: track.album.name,
        artist: track.artists.map(a => a.name).join(', '),
        coverUrl: track.album.images[0]?.url || null,
        durationMs: track.duration_ms,
        id: track.id,
        title: track.name,
      })),
    };
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 503) {
      throw error;
    }
    return { queue: [] };
  }
});
