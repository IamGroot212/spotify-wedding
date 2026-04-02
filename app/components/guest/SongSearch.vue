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
    <div class="ghost-border overflow-hidden rounded-2xl bg-neutral-500 transition-colors focus-within:bg-neutral-400">
      <UInput
        v-model="query"
        :loading="isSearching"
        autocomplete="off"
        class="w-full"
        icon="i-lucide-search"
        placeholder="Song suchen..."
        size="lg"
        variant="none"
      />
    </div>

    <div class="ghost-border overflow-hidden rounded-2xl bg-neutral-500 transition-colors focus-within:bg-neutral-400">
      <UInput
        v-model="guestName"
        class="w-full"
        icon="i-lucide-user"
        placeholder="Dein Name (optional)"
        size="md"
        variant="none"
      />
    </div>

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
        class="flex items-center gap-3 rounded-xl bg-neutral-600 p-3 transition-colors hover:bg-neutral-500"
      >
        <img
          v-if="track.coverUrl"
          :alt="`${track.title} Cover`"
          :src="track.coverUrl"
          class="size-12 shrink-0 rounded-lg"
        >
        <div
          v-else
          class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-neutral-500"
        >
          <UIcon class="size-5 text-neutral-300" name="i-lucide-music" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-neutral-50">
            {{ track.title }}
          </p>
          <p class="truncate text-sm text-neutral-200">
            {{ track.artist }}
          </p>
          <p class="truncate text-xs text-neutral-300">
            {{ track.album }}
          </p>
          <span
            v-if="track.explicit"
            class="mt-1 inline-block rounded bg-gold-900 px-1.5 py-0.5 text-xs text-gold-300"
          >
            E
          </span>
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
      class="py-6 text-center text-sm text-neutral-300"
    >
      Keine Ergebnisse gefunden
    </p>
  </div>
</template>
