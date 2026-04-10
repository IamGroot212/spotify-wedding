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

    // Check current Spotify queue — only add if queue is short
    let queueLength = 0;
    try {
      const queueData = await getQueue();
      queueLength = queueData.queue?.length || 0;
    }
    catch {
      // Spotify not connected, skip this cycle
      return;
    }

    // Only add if queue has 0-1 items
    if (queueLength > 1)
      return;

    // Add to Spotify queue
    await addToQueue(nextSong.spotify_uri);

    // Update status to queued
    sqlite.prepare('UPDATE song_requests SET status = ? WHERE id = ?').run('queued', nextSong.id);

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
  console.log('[queue-scheduler] Started (15s interval)');
});
