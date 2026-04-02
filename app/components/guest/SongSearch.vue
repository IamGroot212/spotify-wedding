<script setup lang="ts">
const emit = defineEmits<{
  submitted: [];
}>();
const { clear, error, isSearching, query, results } = useSongSearch();
const { isSubmitting, submitRequest } = useSongRequest();
const guestName = ref('');
const submittedTrackIds = ref(new Set<string>());

async function handleSubmit(track: (typeof results.value)[0]) {
  await submitRequest(track, guestName.value || undefined);
  submittedTrackIds.value.add(track.id);
  clear();
  emit('submitted');
}
</script>

<template>
  <div class="space-y-6">
    <!-- Search Input -->
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
        <UIcon class="size-5 text-neutral-200/60" name="i-lucide-search" />
      </div>
      <input
        v-model="query"
        class="w-full rounded-xl border-none bg-neutral-500 py-4 pl-12 pr-4 text-neutral-50 transition-all placeholder:text-neutral-200/40 focus:bg-neutral-400 focus:ring-1 focus:ring-gold-300/20"
        placeholder="Song oder Interpret suchen..."
        type="text"
      >
    </div>

    <!-- Guest Name -->
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
        <UIcon class="size-5 text-neutral-200/60" name="i-lucide-user" />
      </div>
      <input
        v-model="guestName"
        class="w-full rounded-xl border-none bg-neutral-500 py-3 pl-12 pr-4 text-base text-neutral-50 transition-all placeholder:text-neutral-200/40 focus:bg-neutral-400 focus:ring-1 focus:ring-gold-300/20"
        placeholder="Dein Name (optional)"
        type="text"
      >
    </div>

    <!-- Error -->
    <UAlert
      v-if="error"
      :description="error"
      color="error"
      icon="i-lucide-alert-circle"
    />

    <!-- Results -->
    <div v-if="results.length" class="space-y-8">
      <div
        v-for="track in results"
        :key="track.id"
        class="flex items-center gap-4"
      >
        <div class="size-14 shrink-0 overflow-hidden rounded-lg shadow-lg">
          <img
            v-if="track.coverUrl"
            :alt="`${track.title} Cover`"
            :src="track.coverUrl"
            class="size-full object-cover"
          >
          <div v-else class="flex size-full items-center justify-center bg-neutral-500">
            <UIcon class="size-5 text-neutral-300" name="i-lucide-music" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="truncate font-semibold text-neutral-50">
              {{ track.title }}
            </h3>
            <span
              v-if="track.explicit"
              class="flex size-4 shrink-0 items-center justify-center rounded-sm border border-[#ffb4ab]/20 bg-neutral-300/30 text-[10px] font-bold text-[#ffb4ab]"
            >
              E
            </span>
          </div>
          <p class="truncate text-sm text-neutral-200/60">
            {{ track.artist }}
          </p>
        </div>

        <!-- Already submitted -->
        <div
          v-if="submittedTrackIds.has(track.id)"
          class="flex shrink-0 items-center gap-1 text-sm font-medium text-gold-300"
        >
          <UIcon class="size-4" name="i-lucide-check-circle" />
          <span>Eingereicht!</span>
        </div>

        <!-- Request button -->
        <button
          v-else
          :disabled="isSubmitting"
          class="shrink-0 rounded-full border border-gold-200/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-gold-200 transition-all hover:bg-gold-200/10 active:scale-95 disabled:opacity-50"
          @click="handleSubmit(track)"
        >
          Vorschlagen
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="isSearching" class="space-y-8 pt-4">
      <div v-for="i in 3" :key="i" class="flex animate-pulse items-center gap-4">
        <div class="size-14 rounded-lg bg-neutral-500" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-3/4 rounded bg-neutral-500" />
          <div class="h-3 w-1/2 rounded bg-neutral-500" />
        </div>
      </div>
    </div>

    <!-- Empty Results -->
    <div
      v-else-if="query.length >= 2 && !error"
      class="flex flex-col items-center px-8 py-12 text-center"
    >
      <div class="mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-600">
        <UIcon class="size-8 text-neutral-200/20" name="i-lucide-search-x" />
      </div>
      <p class="text-sm leading-relaxed text-neutral-200">
        Keine Ergebnisse für <span class="font-serif italic text-gold-200">"{{ query }}"</span><br>
        Versuche einen anderen Song oder Interpreten.
      </p>
    </div>
  </div>
</template>
