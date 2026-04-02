<script setup lang="ts">
import type { TrackInfo } from '~/composables/useSpotifyPlayer';

defineProps<{
  isLoading: boolean;
  queue: TrackInfo[];
}>();

function itemOpacity(index: number): string {
  if (index <= 1)
    return 'opacity-100';
  if (index <= 3)
    return 'opacity-80';
  return 'opacity-60';
}
</script>

<template>
  <div>
    <!-- Skeleton -->
    <div v-if="isLoading && !queue.length" class="space-y-3">
      <div v-for="i in 3" :key="i" class="flex animate-pulse items-center gap-4">
        <div class="size-12 rounded-lg bg-neutral-500" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-3/4 rounded bg-neutral-500" />
          <div class="h-3 w-1/2 rounded bg-neutral-500" />
        </div>
      </div>
    </div>

    <!-- Queue -->
    <div v-else-if="queue.length" class="space-y-3">
      <div
        v-for="(track, index) in queue"
        :key="`${track.id}-${index}`"
        :class="itemOpacity(index)"
        class="flex items-center gap-4"
      >
        <div class="size-12 shrink-0 overflow-hidden rounded-lg">
          <img
            v-if="track.coverUrl"
            :alt="`${track.title} Cover`"
            :src="track.coverUrl"
            class="size-full object-cover"
          >
          <div v-else class="flex size-full items-center justify-center bg-neutral-500">
            <UIcon class="size-4 text-neutral-300" name="i-lucide-music" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <h4 class="truncate text-sm font-medium text-neutral-50">
            {{ track.title }}
          </h4>
          <p class="truncate text-xs text-neutral-200">
            {{ track.artist }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-center">
      <div class="mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-600">
        <UIcon class="size-8 text-gold-300/30" name="i-lucide-list-music" />
      </div>
      <p class="px-8 text-sm leading-relaxed text-neutral-200">
        Noch keine Songs in der Queue — sei der Erste!
      </p>
    </div>
  </div>
</template>
