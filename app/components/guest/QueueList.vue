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
      <USkeleton v-for="i in 3" :key="i" class="h-12 w-full" />
    </div>

    <ul v-else-if="queue.length" class="max-h-80 space-y-2 overflow-y-auto">
      <li
        v-for="(track, index) in queue"
        :key="`${track.id}-${index}`"
        class="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <span class="w-5 shrink-0 text-center text-xs font-medium text-neutral-400">
          {{ index + 1 }}
        </span>

        <img
          v-if="track.coverUrl"
          :alt="`${track.title} Cover`"
          :src="track.coverUrl"
          class="size-10 shrink-0 rounded"
        >
        <div
          v-else
          class="flex size-10 shrink-0 items-center justify-center rounded bg-neutral-200 dark:bg-neutral-800"
        >
          <UIcon class="size-4 text-neutral-400" name="i-lucide-music" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">
            {{ track.title }}
          </p>
          <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {{ track.artist }}
          </p>
        </div>
      </li>
    </ul>

    <p v-else class="py-4 text-center text-sm text-neutral-400">
      Keine Songs in der Warteschlange
    </p>
  </div>
</template>
