<script setup lang="ts">
const { data: nowPlaying, isConnected, refresh: refreshNowPlaying } = useNowPlaying();
const { data: queueData, isLoading: queueLoading, refresh: refreshQueue } = useSpotifyQueue();

function onSubmitted() {
  // Refresh queue shortly after submission to pick up changes
  setTimeout(() => {
    refreshQueue();
    refreshNowPlaying();
  }, 1500);
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 py-6">
    <header class="mb-6 text-center">
      <h1 class="text-2xl font-bold">
        Songwunsch
      </h1>
      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Welchen Song möchtest du hören?
      </p>
    </header>

    <section class="mb-8">
      <GuestSongSearch @submitted="onSubmitted" />
    </section>

    <UDivider class="my-6" />

    <section class="mb-6">
      <h2 class="mb-3 text-lg font-semibold">
        Gerade läuft
      </h2>
      <GuestNowPlaying :data="nowPlaying" :is-connected="isConnected" />
    </section>

    <section>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          Warteschlange
        </h2>
        <UButton
          color="neutral"
          icon="i-lucide-refresh-cw"
          size="xs"
          variant="ghost"
          @click="refreshQueue()"
        />
      </div>
      <GuestQueueList
        :is-loading="queueLoading"
        :queue="queueData?.queue || []"
      />
    </section>
  </div>
</template>
