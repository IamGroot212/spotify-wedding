<script setup lang="ts">
import { useTimestamp } from '@vueuse/core';

definePageMeta({ middleware: 'admin' });

const toast = useToast();
const { data: nowPlaying, refresh: refreshNowPlaying } = useNowPlaying();
const { data: queueData, refresh: refreshQueue } = useSpotifyQueue();

// Interpolated progress
const lastServerUpdate = ref(Date.now());
const serverProgressMs = ref(0);

watch(() => nowPlaying.value?.progressMs, (newProgress) => {
  if (newProgress != null) {
    serverProgressMs.value = newProgress;
    lastServerUpdate.value = Date.now();
  }
});

const now = useTimestamp({ interval: 500 });

const interpolatedProgress = computed(() => {
  if (!nowPlaying.value?.track || !nowPlaying.value.isPlaying)
    return serverProgressMs.value;
  const elapsed = now.value - lastServerUpdate.value;
  return Math.min(serverProgressMs.value + elapsed, nowPlaying.value.track.durationMs);
});

const progressPercent = computed(() => {
  if (!nowPlaying.value?.track)
    return 0;
  return (interpolatedProgress.value / nowPlaying.value.track.durationMs) * 100;
});

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const skipping = ref(false);
async function handleSkip() {
  skipping.value = true;
  try {
    await $fetch('/api/admin/skip', { method: 'POST' });
    toast.add({ color: 'success', title: 'Song übersprungen' });
    setTimeout(() => {
      refreshNowPlaying();
      refreshQueue();
    }, 1000);
  }
  catch {
    toast.add({ color: 'error', title: 'Skip fehlgeschlagen' });
  }
  finally {
    skipping.value = false;
  }
}

const toggling = ref(false);
async function handlePlayPause() {
  toggling.value = true;
  const action = nowPlaying.value?.isPlaying ? 'pause' : 'play';
  try {
    await $fetch('/api/admin/pause', { body: { action }, method: 'POST' });
    setTimeout(refreshNowPlaying, 500);
  }
  catch {
    toast.add({ color: 'error', title: `${action === 'pause' ? 'Pause' : 'Play'} fehlgeschlagen` });
  }
  finally {
    toggling.value = false;
  }
}
</script>

<template>
  <div class="min-h-svh bg-[#141312]">
    <AdminHeader />

    <div class="mx-auto max-w-5xl px-6 py-4">
      <!-- Now Playing Hero -->
      <section v-if="nowPlaying?.track" class="mb-10">
        <div class="shimmer-gold overflow-hidden rounded-2xl border border-gold-300/5 bg-[#1d1b1a] p-6 md:p-10">
          <div class="flex flex-col items-center gap-8 md:flex-row md:items-end">
            <!-- Album Art -->
            <div class="size-48 shrink-0 overflow-hidden rounded-xl shadow-2xl md:size-56">
              <img
                v-if="nowPlaying.track.coverUrl"
                :alt="nowPlaying.track.title"
                :src="nowPlaying.track.coverUrl"
                class="size-full object-cover"
              >
            </div>

            <div class="w-full flex-1 space-y-6">
              <div>
                <span class="text-[10px] uppercase tracking-[0.2em] text-gold-300">Now Playing</span>
                <h2 class="mt-1 line-clamp-2 font-serif text-3xl italic leading-tight text-neutral-50 md:text-4xl">
                  {{ nowPlaying.track.title }}
                </h2>
                <p class="mt-1 text-lg text-gold-300/80">
                  {{ nowPlaying.track.artist }}
                </p>
              </div>

              <!-- Progress -->
              <div class="space-y-2">
                <div class="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    class="h-full bg-gold-300 transition-[width] duration-500"
                    :style="{ width: `${progressPercent}%` }"
                  />
                </div>
                <div class="flex justify-between text-[10px] tracking-widest text-neutral-200">
                  <span>{{ formatTime(interpolatedProgress) }}</span>
                  <span>{{ formatTime(nowPlaying.track.durationMs) }}</span>
                </div>
              </div>

              <!-- Controls -->
              <div class="flex gap-3 pt-2">
                <button
                  :disabled="toggling"
                  class="flex items-center gap-2 rounded-xl bg-gold-300 px-6 py-3 font-medium text-[#6a5314] transition-all active:scale-95 disabled:opacity-50"
                  @click="handlePlayPause"
                >
                  <UIcon
                    :name="nowPlaying.isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
                    class="size-4"
                  />
                  <span class="text-sm uppercase tracking-widest">
                    {{ nowPlaying.isPlaying ? 'Pause' : 'Play' }}
                  </span>
                </button>
                <button
                  :disabled="skipping"
                  class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-gold-200 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
                  @click="handleSkip"
                >
                  <UIcon class="size-4" name="i-lucide-skip-forward" />
                  <span class="text-sm uppercase tracking-widest">Skip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Empty Now Playing -->
      <div v-else class="mb-10 rounded-2xl bg-[#1d1b1a] p-12 text-center">
        <UIcon class="mx-auto mb-4 size-12 text-gold-300/20" name="i-lucide-music" />
        <p class="text-neutral-200/60">
          Kein Song wird gerade abgespielt
        </p>
      </div>

      <!-- Queue List -->
      <section>
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-serif text-2xl italic text-neutral-50">
            Queue
          </h3>
          <span class="text-sm uppercase tracking-widest text-gold-300">
            {{ queueData?.queue?.length || 0 }} Songs
          </span>
        </div>

        <div v-if="queueData?.queue?.length" class="space-y-2">
          <div
            v-for="(track, index) in queueData.queue"
            :key="`${track.id}-${index}`"
            class="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 transition-all hover:border-white/5 hover:bg-[#211f1e]"
          >
            <span class="w-8 text-sm tabular-nums text-neutral-200/40">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <div class="size-12 shrink-0 overflow-hidden rounded-lg border border-white/5 shadow-lg">
              <img
                v-if="track.coverUrl"
                :alt="track.title"
                :src="track.coverUrl"
                class="size-full object-cover"
              >
              <div v-else class="flex size-full items-center justify-center bg-neutral-500">
                <UIcon class="size-4 text-neutral-300" name="i-lucide-music" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-serif text-lg text-neutral-50">
                {{ track.title }}
              </p>
              <p class="truncate text-sm italic text-neutral-200/60">
                {{ track.artist }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center py-16 text-center">
          <UIcon class="mb-4 size-12 text-gold-300/10" name="i-lucide-list-music" />
          <h4 class="font-serif text-xl text-neutral-50">
            Queue ist leer
          </h4>
          <p class="mt-1 text-sm text-neutral-200/60">
            Genehmige Requests um Songs hinzuzufügen.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
