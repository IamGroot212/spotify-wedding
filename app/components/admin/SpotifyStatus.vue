<script setup lang="ts">
const { data: spotifyStatus } = useFetch<{
  connected: boolean;
  expired?: boolean;
}>('/api/auth/spotify/status', { server: false });

const { data: devicesData } = useFetch<{
  devices: Array<{
    id: string;
    isActive: boolean;
    name: string;
    type: string;
  }>;
}>('/api/spotify/devices', { server: false });

const activeDevice = computed(() =>
  devicesData.value?.devices?.find(d => d.isActive) || null,
);
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Connected badge -->
    <div
      v-if="spotifyStatus?.connected && activeDevice"
      class="hidden items-center gap-2 rounded-full border border-white/5 bg-neutral-500 px-3 py-1.5 md:flex"
    >
      <span class="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
      <span class="text-xs text-neutral-200">{{ activeDevice.name }}</span>
    </div>

    <!-- Not connected -->
    <a
      v-else-if="spotifyStatus && !spotifyStatus.connected"
      class="flex items-center gap-2 rounded-full border border-[#ffb4ab]/20 bg-[#93000a]/20 px-3 py-1.5 text-xs text-[#ffb4ab] transition-colors hover:bg-[#93000a]/30"
      href="/api/auth/spotify/connect"
    >
      <UIcon class="size-4" name="i-lucide-unplug" />
      Verbinden
    </a>

    <!-- No device -->
    <div
      v-else-if="spotifyStatus?.connected && !activeDevice"
      class="hidden items-center gap-2 rounded-full border border-gold-300/20 bg-gold-900/20 px-3 py-1.5 md:flex"
    >
      <UIcon class="size-4 text-gold-300" name="i-lucide-speaker" />
      <span class="text-xs text-gold-300">Kein Gerät</span>
    </div>
  </div>
</template>
