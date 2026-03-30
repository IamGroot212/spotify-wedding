<script setup lang="ts">
const emit = defineEmits<{
  submitted: [];
}>();
const { clear, error, isSearching, query, results } = useSongSearch();
const { isSubmitting, submitRequest } = useSongRequest();
const guestName = ref('');

async function handleSubmit(track: (typeof results.value)[0]) {
  await submitRequest(track, guestName.value || undefined);
  clear();
  emit('submitted');
}
</script>

<template>
  <div class="space-y-4">
    <UInput
      v-model="query"
      :loading="isSearching"
      autocomplete="off"
      icon="i-lucide-search"
      placeholder="Song suchen..."
      size="lg"
    />

    <UInput
      v-model="guestName"
      icon="i-lucide-user"
      placeholder="Dein Name (optional)"
      size="md"
    />

    <UAlert
      v-if="error"
      :description="error"
      color="error"
      icon="i-lucide-alert-circle"
    />

    <div v-if="results.length" class="max-h-96 space-y-2 overflow-y-auto">
      <div
        v-for="track in results"
        :key="track.id"
        class="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
      >
        <img
          v-if="track.coverUrl"
          :alt="`${track.title} Cover`"
          :src="track.coverUrl"
          class="size-12 shrink-0 rounded"
        >
        <div
          v-else
          class="flex size-12 shrink-0 items-center justify-center rounded bg-neutral-200 dark:bg-neutral-800"
        >
          <UIcon class="size-5 text-neutral-400" name="i-lucide-music" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">
            {{ track.title }}
          </p>
          <p class="truncate text-sm text-neutral-500 dark:text-neutral-400">
            {{ track.artist }}
          </p>
          <p class="truncate text-xs text-neutral-400">
            {{ track.album }}
          </p>
          <UBadge
            v-if="track.explicit"
            class="mt-1"
            color="warning"
            size="xs"
            variant="subtle"
          >
            Explicit
          </UBadge>
        </div>

        <UButton
          :disabled="isSubmitting"
          :loading="isSubmitting"
          color="primary"
          icon="i-lucide-plus"
          size="sm"
          @click="handleSubmit(track)"
        >
          Vorschlagen
        </UButton>
      </div>
    </div>

    <p
      v-else-if="query.length >= 2 && !isSearching && !error"
      class="py-4 text-center text-sm text-neutral-400"
    >
      Keine Ergebnisse gefunden
    </p>
  </div>
</template>
