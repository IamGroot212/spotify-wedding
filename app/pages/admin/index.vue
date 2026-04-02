<script setup lang="ts">
definePageMeta({ middleware: 'admin' });

const route = useRoute();
const toast = useToast();

onMounted(() => {
  if (route.query.spotify === 'connected') {
    toast.add({ color: 'success', title: 'Spotify erfolgreich verbunden!' });
  }
  if (route.query.error === 'spotify_denied') {
    toast.add({ color: 'error', title: 'Spotify-Verbindung abgelehnt' });
  }
  if (route.query.error === 'spotify_auth_failed') {
    toast.add({ color: 'error', title: 'Spotify-Authentifizierung fehlgeschlagen' });
  }
});

const { data: nowPlaying } = useNowPlaying();
</script>

<template>
  <div class="flex min-h-svh bg-[#141312]">
    <!-- Main Content -->
    <main class="min-w-0 flex-1 pb-24">
      <!-- Header -->
      <header class="sticky top-0 z-40 flex items-center justify-between bg-[#141312] px-6 py-4">
        <div>
          <h1 class="font-serif text-2xl italic text-gold-300">
            Admin Concierge
          </h1>
          <p class="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-gold-300/40">
            Songvorschläge verwalten
          </p>
        </div>
        <AdminSpotifyStatus />
      </header>

      <div class="mx-auto max-w-5xl px-6 py-4">
        <!-- Now Playing (compact) -->
        <div class="mb-6 flex items-center gap-4 rounded-2xl bg-[#1d1b1a] p-4">
          <img
            v-if="nowPlaying?.track?.coverUrl"
            :src="nowPlaying.track.coverUrl"
            :alt="nowPlaying.track.title"
            class="size-12 rounded-lg object-cover shadow-lg"
          >
          <div v-if="nowPlaying?.track" class="min-w-0 flex-1">
            <p class="truncate font-serif text-sm italic text-gold-200">
              {{ nowPlaying.track.title }}
            </p>
            <p class="truncate text-xs text-neutral-200/60">
              {{ nowPlaying.track.artist }}
            </p>
          </div>
          <span v-else class="text-sm text-neutral-200/40">Kein Song aktiv</span>
          <span
            v-if="nowPlaying?.isPlaying"
            class="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
          />
        </div>

        <!-- Request List -->
        <AdminRequestList />
      </div>
    </main>
  </div>
</template>
