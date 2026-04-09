<script setup lang="ts">
const { data: spotifyStatus, refresh: refreshStatus } = useFetch<{
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

const showMenu = ref(false);
</script>

<template>
  <div class="relative flex items-center gap-3">
    <!-- Status badge (clickable) -->
    <button
      v-if="spotifyStatus?.connected"
      class="hidden items-center gap-2 rounded-full border border-white/5 bg-neutral-500 px-3 py-1.5 transition-colors hover:bg-neutral-400 md:flex"
      @click="showMenu = !showMenu"
    >
      <span
        :class="activeDevice ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gold-300'"
        class="size-2 rounded-full"
      />
      <span class="text-xs text-neutral-200">
        {{ activeDevice ? activeDevice.name : 'Kein Gerät' }}
      </span>
      <UIcon class="size-3 text-neutral-200/40" name="i-lucide-chevron-down" />
    </button>

    <!-- Not connected -->
    <a
      v-else-if="spotifyStatus && !spotifyStatus.connected"
      class="flex items-center gap-2 rounded-full border border-[#ffb4ab]/20 bg-[#93000a]/20 px-3 py-1.5 text-xs text-[#ffb4ab] transition-colors hover:bg-[#93000a]/30"
      href="/api/auth/spotify/connect"
    >
      <UIcon class="size-4" name="i-lucide-unplug" />
      Verbinden
    </a>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition-all duration-150"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition-all duration-100"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="showMenu"
        class="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#211f1e] p-2 shadow-2xl"
      >
        <div class="border-b border-white/5 px-3 py-2">
          <p class="text-[10px] uppercase tracking-widest text-gold-300/40">
            Spotify Status
          </p>
          <p class="mt-1 text-sm text-neutral-50">
            {{ spotifyStatus?.connected ? 'Verbunden' : 'Getrennt' }}
          </p>
        </div>

        <a
          class="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-200 transition-colors hover:bg-white/5"
          href="/api/auth/spotify/connect"
          @click="showMenu = false"
        >
          <UIcon class="size-4" name="i-lucide-refresh-cw" />
          Neu verbinden
        </a>

        <button
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-200 transition-colors hover:bg-white/5"
          @click="refreshStatus(); showMenu = false"
        >
          <UIcon class="size-4" name="i-lucide-activity" />
          Status prüfen
        </button>
      </div>
    </Transition>

    <!-- Click outside to close -->
    <div
      v-if="showMenu"
      class="fixed inset-0 z-40"
      @click="showMenu = false"
    />
  </div>
</template>
