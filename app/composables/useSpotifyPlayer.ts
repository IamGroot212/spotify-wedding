import { useIntervalFn } from '@vueuse/core';

export type TrackInfo = {
  album: string;
  artist: string;
  coverUrl: string | null;
  durationMs: number;
  id: string;
  title: string;
};

export type NowPlayingData = {
  isPlaying: boolean;
  progressMs?: number;
  track: TrackInfo | null;
};

export type QueueData = {
  queue: TrackInfo[];
};

export function useNowPlaying() {
  const config = useRuntimeConfig();
  const interval = config.public.pollingIntervals.nowPlaying;

  const { data, error, refresh, status } = useFetch<NowPlayingData>('/api/spotify/now-playing', {
    server: false,
  });

  const { pause, resume } = useIntervalFn(refresh, interval, { immediate: false });

  // Start polling when mounted
  onMounted(() => resume());
  onUnmounted(() => pause());

  const isConnected = computed(() => !error.value || error.value.statusCode !== 503);

  return {
    data,
    error,
    isConnected,
    isLoading: computed(() => status.value === 'pending'),
    pause,
    refresh,
    resume,
  };
}

export function useSpotifyQueue() {
  const config = useRuntimeConfig();
  const interval = config.public.pollingIntervals.queue;

  const { data, error, refresh, status } = useFetch<QueueData>('/api/spotify/queue', {
    server: false,
  });

  const { pause, resume } = useIntervalFn(refresh, interval, { immediate: false });

  onMounted(() => resume());
  onUnmounted(() => pause());

  return {
    data,
    error,
    isLoading: computed(() => status.value === 'pending'),
    pause,
    refresh,
    resume,
  };
}
