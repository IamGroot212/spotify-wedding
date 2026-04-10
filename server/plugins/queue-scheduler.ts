let lastQueuedAt = 0;

async function processQueue() {
  try {
    const sqlite = useSqlite();

    // Check if scheduler is enabled
    const settings = sqlite.prepare('SELECT queue_scheduler_enabled FROM app_settings WHERE id = 1').get() as { queue_scheduler_enabled: number } | undefined;
    if (!settings?.queue_scheduler_enabled)
      return;

    // Get next approved song (oldest first)
    const nextSong = sqlite.prepare('SELECT id, spotify_uri, title, artist FROM song_requests WHERE status = ? ORDER BY created_at ASC LIMIT 1').get('approved') as { artist: string; id: number; spotify_uri: string; title: string } | undefined;
    if (!nextSong)
      return;

    // Check if currently playing — don't queue if nothing is playing
    let isPlaying = false;
    try {
      const nowPlaying = await getCurrentlyPlaying();
      isPlaying = !!nowPlaying?.is_playing;
    }
    catch {
      return;
    }
    if (!isPlaying)
      return;

    // Minimum gap: wait at least 3 minutes between our queued songs
    // This ensures playlist songs play in between
    const minGapMs = 3 * 60 * 1000;
    const now = Date.now();
    if (now - lastQueuedAt < minGapMs)
      return;

    // Add to Spotify queue
    await addToQueue(nextSong.spotify_uri);

    // Update status to queued
    sqlite.prepare('UPDATE song_requests SET status = ? WHERE id = ?').run('queued', nextSong.id);
    lastQueuedAt = now;

    // eslint-disable-next-line no-console
    console.log(`[queue-scheduler] Added: ${nextSong.title} - ${nextSong.artist}`);
  }
  catch (err) {
    console.error('[queue-scheduler] Error:', err instanceof Error ? err.message : err);
  }
}

export default defineNitroPlugin(() => {
  setInterval(processQueue, 15_000);

  // eslint-disable-next-line no-console
  console.log('[queue-scheduler] Started (15s interval, 3min gap between songs)');
});
