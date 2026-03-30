<script setup lang="ts">
definePageMeta({ middleware: 'admin' });

const route = useRoute();
const toast = useToast();

// Handle OAuth redirect messages
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
  <div class="mx-auto max-w-4xl px-4 py-6">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">
        Admin
      </h1>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Songvorschläge verwalten & Spotify-Status
      </p>
    </header>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Songvorschläge
            </h2>
          </template>
          <AdminRequestList />
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard>
          <AdminSpotifyStatus />
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Gerade läuft
            </h2>
          </template>
          <GuestNowPlaying
            :data="nowPlaying"
            :is-connected="true"
          />
        </UCard>
      </div>
    </div>
  </div>
</template>
