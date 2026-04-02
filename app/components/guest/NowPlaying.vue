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
  <section class="relative flex flex-col items-center">
    <UAlert
      v-if="!isConnected"
      class="w-full"
      color="warning"
      description="Spotify ist nicht verbunden."
      icon="i-lucide-wifi-off"
      title="Keine Verbindung"
    />

    <template v-else-if="data?.track">
      <!-- Ambient Glow -->
      <div class="ambient-glow pointer-events-none absolute -top-8 left-1/2 size-64 -translate-x-1/2" />

      <div class="relative z-10 w-[160px]">
        <!-- Album Art -->
        <div class="aspect-square w-full overflow-hidden rounded-xl shadow-2xl">
          <img
            v-if="data.track.coverUrl"
            :alt="`${data.track.title} Cover`"
            :src="data.track.coverUrl"
            class="size-full object-cover"
          >
          <div
            v-else
            class="flex size-full items-center justify-center bg-neutral-600"
          >
            <UIcon class="size-16 text-neutral-300" name="i-lucide-music" />
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-3 w-full">
          <div class="h-[2px] w-full overflow-hidden rounded-full bg-neutral-300">
            <div
              class="h-full bg-gold-300 transition-[width] duration-500"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
          <div class="mt-1 flex justify-between">
            <span class="text-[10px] uppercase tracking-wider text-neutral-200">
              {{ formatTime(interpolatedProgress) }}
            </span>
            <span class="text-[10px] uppercase tracking-wider text-neutral-200">
              {{ formatTime(data.track.durationMs) }}
            </span>
          </div>
        </div>

        <!-- Song Info -->
        <div class="mt-2 text-center">
          <h2 class="line-clamp-2 font-serif text-lg italic leading-tight text-gold-200">
            {{ data.track.title }}
          </h2>
          <p class="mt-0.5 truncate text-xs text-neutral-200">
            {{ data.track.artist }}
          </p>
          <span
            v-if="!data.isPlaying"
            class="mt-2 inline-block text-[10px] uppercase tracking-widest text-neutral-300/60"
          >
            Pausiert
          </span>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center py-6 text-center"
    >
      <div class="mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-600">
        <UIcon class="size-8 text-gold-300/30" name="i-lucide-music" />
      </div>
      <p class="px-8 text-sm leading-relaxed text-neutral-200">
        Kein Song wird gerade abgespielt
      </p>
    </div>
  </section>
</template>
