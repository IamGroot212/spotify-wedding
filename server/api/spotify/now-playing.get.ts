export default defineEventHandler(async () => {
  try {
    const data = await getCurrentlyPlaying();
    if (!data || !data.item) {
      return { isPlaying: false, track: null };
    }

    return {
      isPlaying: data.is_playing,
      progressMs: data.progress_ms,
      track: {
        album: data.item.album.name,
        artist: data.item.artists.map(a => a.name).join(', '),
        coverUrl: data.item.album.images[0]?.url || null,
        durationMs: data.item.duration_ms,
        id: data.item.id,
        title: data.item.name,
      },
    };
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 503) {
      throw error;
    }
    return { isPlaying: false, track: null };
  }
});
