<script setup lang="ts">
import type { TrackInfo } from '~/composables/useSpotifyPlayer';

defineProps<{
  isLoading: boolean;
  queue: TrackInfo[];
}>();
</script>

<template>
  <div>
    <div v-if="isLoading && !queue.length" class="space-y-3">
      <USkeleton v-for="i in 3" :key="i" class="h-14 w-full rounded-xl" />
    </div>

    <ul v-else-if="queue.length" class="max-h-96 space-y-1 overflow-y-auto">
      <li
        v-for="(track, index) in queue"
        :key="`${track.id}-${index}`"
        class="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-600"
      >
        <span class="w-5 shrink-0 text-center text-xs tabular-nums text-neutral-300">
          {{ index + 1 }}
        </span>

        <img
          v-if="track.coverUrl"
          :alt="`${track.title} Cover`"
          :src="track.coverUrl"
          class="size-10 shrink-0 rounded-lg"
        >
        <div
          v-else
          class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-500"
        >
          <UIcon class="size-4 text-neutral-300" name="i-lucide-music" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-neutral-50">
            {{ track.title }}
          </p>
          <p class="truncate text-xs text-neutral-300">
            {{ track.artist }}
          </p>
        </div>
      </li>
    </ul>

    <p v-else class="py-8 text-center text-sm text-neutral-300">
      Keine Songs in der Warteschlange
    </p>
  </div>
</template>
