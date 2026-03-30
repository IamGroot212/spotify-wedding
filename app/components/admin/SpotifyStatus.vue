<script setup lang="ts">
const { data: spotifyStatus, refresh: refreshStatus } = useFetch<{
  connected: boolean;
  expired?: boolean;
}>('/api/auth/spotify/status', { server: false });

const { data: devicesData, refresh: refreshDevices } = useFetch<{
  devices: Array<{
    id: string;
    isActive: boolean;
    name: string;
    type: string;
    volumePercent: number;
  }>;
}>('/api/spotify/devices', { server: false });

async function refreshAll() {
  await Promise.all([refreshStatus(), refreshDevices()]);
}

const activeDevice = computed(() =>
  devicesData.value?.devices?.find(d => d.isActive) || null,
);
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">
        Spotify-Verbindung
      </h3>
      <UButton
        color="neutral"
        icon="i-lucide-refresh-cw"
        size="xs"
        variant="ghost"
        @click="refreshAll"
      />
    </div>

    <template v-if="spotifyStatus?.connected">
      <UAlert
        color="success"
        description="Token aktiv"
        icon="i-lucide-check-circle"
        title="Verbunden"
      />

      <UAlert
        v-if="spotifyStatus.expired"
        color="warning"
        description="Token wird bei nächster Anfrage erneuert."
        icon="i-lucide-alert-triangle"
        title="Token abgelaufen"
      />

      <div v-if="activeDevice" class="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
        <p class="text-sm font-medium">
          Aktives Gerät
        </p>
        <p class="text-sm text-neutral-500">
          {{ activeDevice.name }} ({{ activeDevice.type }})
        </p>
        <p class="text-xs text-neutral-400">
          Lautstärke: {{ activeDevice.volumePercent }}%
        </p>
      </div>

      <UAlert
        v-else-if="devicesData"
        color="warning"
        description="Kein aktives Spotify-Gerät gefunden. Bitte starte die Wiedergabe auf einem Gerät."
        icon="i-lucide-speaker"
        title="Kein Gerät aktiv"
      />
    </template>

    <template v-else>
      <UAlert
        color="error"
        description="Bitte verbinde dein Spotify-Konto."
        icon="i-lucide-unplug"
        title="Nicht verbunden"
      />

      <UButton
        block
        color="primary"
        icon="i-lucide-external-link"
        to="/api/auth/spotify/connect"
        external
      >
        Mit Spotify verbinden
      </UButton>
    </template>
  </div>
</template>
