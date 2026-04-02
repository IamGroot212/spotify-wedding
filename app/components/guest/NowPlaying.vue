<script setup lang="ts">
import type { NowPlayingData } from '~/composables/useSpotifyPlayer';
import { useTimestamp } from '@vueuse/core';

const props = defineProps<{
  data: NowPlayingData | null;
  isConnected: boolean;
}>();

const lastServerUpdate = ref(Date.now());
const serverProgressMs = ref(0);

watch(() => props.data?.progressMs, (newProgress) => {
  if (newProgress != null) {
    serverProgressMs.value = newProgress;
    lastServerUpdate.value = Date.now();
  }
});

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
  <div>
    <UAlert
      v-if="!isConnected"
      color="warning"
      description="Spotify ist nicht verbunden."
      icon="i-lucide-wifi-off"
      title="Keine Verbindung"
    />

    <div
      v-else-if="data?.track"
      class="shimmer-gold overflow-hidden rounded-2xl bg-neutral-600 p-4"
    >
      <p class="mb-3 text-xs uppercase tracking-widest text-neutral-200">
        Gerade läuft
      </p>

      <div class="flex items-center gap-4">
        <img
          v-if="data.track.coverUrl"
          :alt="`${data.track.title} Cover`"
          :src="data.track.coverUrl"
          class="size-20 shrink-0 rounded-xl shadow-lg shadow-black/40"
        >
        <div
          v-else
          class="flex size-20 shrink-0 items-center justify-center rounded-xl bg-neutral-500"
        >
          <UIcon class="size-8 text-neutral-300" name="i-lucide-music" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate font-serif text-xl font-medium text-gold-200">
            {{ data.track.title }}
          </p>
          <p class="mt-0.5 truncate text-sm text-neutral-200">
            {{ data.track.artist }}
          </p>

          <div v-if="data.isPlaying" class="mt-3 space-y-1">
            <UProgress :model-value="progressPercent" :max="100" color="primary" size="xs" />
            <div class="flex justify-between text-xs text-neutral-300">
              <span>{{ formatTime(interpolatedProgress) }}</span>
              <span>{{ formatTime(data.track.durationMs) }}</span>
            </div>
          </div>

          <span
            v-if="!data.isPlaying"
            class="mt-2 inline-block rounded-full bg-neutral-500 px-2.5 py-0.5 text-xs text-neutral-100"
          >
            Pausiert
          </span>
        </div>
      </div>
    </div>

    <div
      v-else
      class="rounded-2xl bg-neutral-600 py-8 text-center text-sm text-neutral-300"
    >
      Kein Song wird gerade abgespielt
    </div>
  </div>
</template>
