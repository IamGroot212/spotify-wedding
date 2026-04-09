import { eq } from 'drizzle-orm';

let _intervalId: ReturnType<typeof setInterval> | null = null;

async function processQueue() {
  try {
    // Check if scheduler is enabled
    const settings = await db.query.appSettings.findFirst();
    if (!settings?.queueSchedulerEnabled)
      return;

    // Check if there are approved songs waiting
    const nextSong = await db.query.songRequests.findFirst({
      where: eq(schema.songRequests.status, 'approved'),
      orderBy: (requests, { asc }) => [asc(requests.createdAt)],
    });

    if (!nextSong)
      return;

    // Check current Spotify queue — only add if queue is short
    const queueData = await getQueue();
    // Only songs we added (not playlist tracks) show in the queue
    // If queue has 0-1 items, add the next approved song
    if (queueData.queue.length > 1)
      return;

    // Add to Spotify queue
    await addToQueue(nextSong.spotifyUri);

    // Update status
    await db.update(schema.songRequests)
      .set({ status: 'queued' })
      .where(eq(schema.songRequests.id, nextSong.id));

    // eslint-disable-next-line no-console
    console.log(`[queue-scheduler] Added to queue: ${nextSong.title} - ${nextSong.artist}`);
  }
  catch {
    // Silently fail — will retry next interval
  }
}

export default defineNitroPlugin(() => {
  // Check every 15 seconds
  _intervalId = setInterval(processQueue, 15_000);

  // eslint-disable-next-line no-console
  console.log('[queue-scheduler] Started (15s interval)');
});
