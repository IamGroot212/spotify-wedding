<script setup lang="ts">
const { data: nowPlaying, isConnected, refresh: refreshNowPlaying } = useNowPlaying();
const { data: queueData, isLoading: queueLoading, refresh: refreshQueue } = useSpotifyQueue();

function onSubmitted() {
  setTimeout(() => {
    refreshQueue();
    refreshNowPlaying();
  }, 1500);
}
</script>

<template>
  <div class="mx-auto max-w-lg px-5 py-8">
    <header class="mb-10 text-center">
      <h1 class="font-serif text-3xl font-light tracking-tight text-gold-200">
        Songwunsch
      </h1>
      <p class="mt-2 text-sm tracking-wide text-neutral-200">
        Welchen Song möchtest du hören?
      </p>
    </header>

    <section class="mb-10">
      <GuestSongSearch @submitted="onSubmitted" />
    </section>

    <section class="mb-8">
      <GuestNowPlaying :data="nowPlaying" :is-connected="isConnected" />
    </section>

    <section>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-serif text-lg font-light tracking-tight text-gold-200">
          Als Nächstes
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
