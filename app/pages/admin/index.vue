<script setup lang="ts">
definePageMeta({ middleware: 'admin' });

const route = useRoute();
const toast = useToast();

async function handleLogout() {
  await $fetch('/api/admin/logout', { method: 'POST' });
  await navigateTo('/admin/login');
}

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

const { data: stats, refresh: refreshStats } = useFetch<{
  pending: number;
  queued: number;
  rejected: number;
  total: number;
}>('/api/admin/stats', { server: false });

// Poll stats alongside request list
const statsInterval = ref<ReturnType<typeof setInterval>>();
onMounted(() => {
  statsInterval.value = setInterval(refreshStats, 5000);
});
onUnmounted(() => {
  if (statsInterval.value)
    clearInterval(statsInterval.value);
});
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
        <div class="flex items-center gap-3">
          <AdminSpotifyStatus />
          <button
            class="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200/60 transition-colors hover:bg-white/5 hover:text-neutral-200"
            @click="handleLogout"
          >
            <UIcon class="size-4" name="i-lucide-log-out" />
            Logout
          </button>
        </div>
      </header>

      <div class="mx-auto max-w-5xl px-6 py-4">
        <!-- Stats -->
        <div v-if="stats" class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div class="rounded-2xl border border-white/5 bg-[#1d1b1a] p-4">
            <span class="text-[10px] uppercase tracking-widest text-gold-300/40">Gesamt</span>
            <p class="mt-1 font-serif text-3xl italic text-neutral-50">
              {{ stats.total }}
            </p>
          </div>
          <div class="rounded-2xl border border-gold-300/10 bg-neutral-500 p-4">
            <span class="text-[10px] uppercase tracking-widest text-gold-300/40">Ausstehend</span>
            <p class="mt-1 font-serif text-3xl italic text-gold-300">
              {{ stats.pending }}
            </p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-[#1d1b1a] p-4">
            <span class="text-[10px] uppercase tracking-widest text-gold-300/40">In Queue</span>
            <p class="mt-1 font-serif text-3xl italic text-emerald-400">
              {{ stats.queued }}
            </p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-[#1d1b1a] p-4">
            <span class="text-[10px] uppercase tracking-widest text-gold-300/40">Abgelehnt</span>
            <p class="mt-1 font-serif text-3xl italic text-[#ffb4ab]">
              {{ stats.rejected }}
            </p>
          </div>
        </div>

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
