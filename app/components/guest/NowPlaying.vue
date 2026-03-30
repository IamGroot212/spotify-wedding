<script setup lang="ts">
import type { NowPlayingData } from '~/composables/useSpotifyPlayer';
import { useTimestamp } from '@vueuse/core';

const props = defineProps<{
  data: NowPlayingData | null;
  isConnected: boolean;
}>();

// Track when we last received data from the server
const lastServerUpdate = ref(Date.now());
const serverProgressMs = ref(0);

watch(() => props.data?.progressMs, (newProgress) => {
  if (newProgress != null) {
    serverProgressMs.value = newProgress;
    lastServerUpdate.value = Date.now();
  }
});

// Interpolate progress between polls
const now = useTimestamp({ interval: 500 });

const interpolatedProgress = computed(() => {
  if (!props.data?.track || !props.data.isPlaying)
    return serverProgressMs.value;

  const elapsed = now.value - lastServerUpdate.value;
  return Math.min(
    serverProgressMs.value + elapsed,
    props.data.track.durationMs,
  );
});

const progressPercent = computed(() => {
  if (!props.data?.track)
    return 0;
  return (interpolatedProgress.value / props.data.track.durationMs) * 100;
});

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
</script>

<template>
  <div class="space-y-3">
    <UAlert
      v-if="!isConnected"
      color="warning"
      description="Spotify ist nicht verbunden."
      icon="i-lucide-wifi-off"
      title="Keine Verbindung"
    />

    <div v-else-if="data?.track" class="flex items-center gap-4">
      <img
        v-if="data.track.coverUrl"
        :alt="`${data.track.title} Cover`"
        :src="data.track.coverUrl"
        class="size-16 shrink-0 rounded-lg shadow-md sm:size-20"
      >
      <div
        v-else
        class="flex size-16 shrink-0 items-center justify-center rounded-lg bg-neutral-200 sm:size-20 dark:bg-neutral-800"
      >
        <UIcon class="size-8 text-neutral-400" name="i-lucide-music" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-lg font-semibold">
          {{ data.track.title }}
        </p>
        <p class="truncate text-sm text-neutral-500 dark:text-neutral-400">
          {{ data.track.artist }}
        </p>

        <div v-if="data.isPlaying" class="mt-2 space-y-1">
          <UProgress :model-value="progressPercent" :max="100" color="primary" size="xs" />
          <div class="flex justify-between text-xs text-neutral-400">
            <span>{{ formatTime(interpolatedProgress) }}</span>
            <span>{{ formatTime(data.track.durationMs) }}</span>
          </div>
        </div>

        <UBadge
          v-if="!data.isPlaying"
          class="mt-1"
          color="neutral"
          size="xs"
          variant="subtle"
        >
          Pausiert
        </UBadge>
      </div>
    </div>

    <div
      v-else
      class="py-4 text-center text-sm text-neutral-400"
    >
      Kein Song wird gerade abgespielt
    </div>
  </div>
</template>
