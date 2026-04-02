<script setup lang="ts">
const { data: nowPlaying, isConnected, refresh: refreshNowPlaying } = useNowPlaying();
const { data: queueData, isLoading: queueLoading, refresh: refreshQueue } = useSpotifyQueue();

const showSearch = ref(false);

function onSubmitted() {
  setTimeout(() => {
    refreshQueue();
    refreshNowPlaying();
  }, 1500);
}
</script>

<template>
  <div class="relative mx-auto flex min-h-svh max-w-[390px] flex-col overflow-x-hidden">
    <!-- Header -->
    <header class="sticky top-0 z-50 flex items-center gap-2 bg-[#141312] px-6 py-4">
      <UIcon class="size-5 text-gold-200" name="i-lucide-music-2" />
      <h1 class="font-serif text-xl italic tracking-tight text-gold-200">
        The Midnight Concierge
      </h1>
    </header>

    <!-- Search Overlay -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="showSearch"
        class="fixed inset-0 z-50 flex flex-col bg-[#141312]"
      >
        <header class="flex items-center gap-4 px-6 py-6">
          <button
            class="-ml-2 rounded-full p-2 text-gold-200 transition-colors hover:bg-neutral-500"
            @click="showSearch = false"
          >
            <UIcon class="size-6" name="i-lucide-arrow-left" />
          </button>
          <h1 class="font-serif text-2xl italic tracking-tight text-gold-200">
            Song vorschlagen
          </h1>
        </header>
        <div class="flex-1 overflow-y-auto px-6 pb-24">
          <GuestSongSearch @submitted="onSubmitted(); showSearch = false" />
        </div>
        <footer class="px-8 py-6 text-center">
          <p class="text-[10px] uppercase tracking-[0.15em] text-neutral-300/40">
            Songs werden vor dem Abspielen geprüft
          </p>
        </footer>
      </div>
    </Transition>

    <main class="flex-1 px-6 pb-32 pt-4">
      <!-- Now Playing Hero -->
      <GuestNowPlaying :data="nowPlaying" :is-connected="isConnected" />

      <!-- Queue Section -->
      <section class="mt-10">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-[10px] font-medium uppercase tracking-[0.1em] text-neutral-200">
            Als Nächstes
          </h3>
          <span class="text-[10px] text-gold-300/40">
            {{ queueData?.queue?.length || 0 }} Songs in der Queue
          </span>
        </div>
        <GuestQueueList
          :is-loading="queueLoading"
          :queue="queueData?.queue || []"
        />
      </section>
    </main>

    <!-- Floating Request Button -->
    <div
      class="pointer-events-none fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 bg-gradient-to-t from-[#141312] to-transparent px-6 pb-8 pt-12"
    >
      <button
        class="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gold-300 py-4 font-semibold text-[#6a5314] shadow-[0px_10px_30px_rgba(106,83,20,0.3)] transition-transform duration-150 active:scale-95"
        @click="showSearch = true"
      >
        <UIcon class="size-5" name="i-lucide-plus-circle" />
        Song vorschlagen
      </button>
    </div>
  </div>
</template>
