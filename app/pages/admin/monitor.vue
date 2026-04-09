<script setup lang="ts">
definePageMeta({ middleware: 'admin' });

type SystemInfo = {
  cpu: { cores: number; load1m: number; load5m: number; load15m: number };
  disk: { total: number; used: number; usedPercent: number };
  memory: { total: number; used: number; usedPercent: number };
  temperature: number | null;
  uptime: number;
};

const { data, refresh } = useFetch<SystemInfo>('/api/admin/system', { server: false });

const interval = ref<ReturnType<typeof setInterval>>();
onMounted(() => {
  interval.value = setInterval(refresh, 5000);
});
onUnmounted(() => {
  if (interval.value)
    clearInterval(interval.value);
});

function formatBytes(bytes: number): string {
  if (bytes < 1024 ** 2)
    return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3)
    return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
  return `${(bytes / (1024 ** 3)).toFixed(1)} GB`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0)
    return `${days}d ${hours}h ${mins}m`;
  if (hours > 0)
    return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function tempColor(temp: number | null): string {
  if (!temp)
    return 'text-neutral-200';
  if (temp < 50)
    return 'text-emerald-400';
  if (temp < 70)
    return 'text-gold-300';
  return 'text-[#ffb4ab]';
}

function usageColor(percent: number): string {
  if (percent < 60)
    return 'text-emerald-400';
  if (percent < 85)
    return 'text-gold-300';
  return 'text-[#ffb4ab]';
}

function usageBarColor(percent: number): string {
  if (percent < 60)
    return 'bg-emerald-500';
  if (percent < 85)
    return 'bg-gold-300';
  return 'bg-[#ffb4ab]';
}
</script>

<template>
  <div class="min-h-svh bg-[#141312]">
    <AdminHeader />

    <div class="mx-auto max-w-3xl px-6 py-4">
      <div v-if="data" class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <!-- Temperature -->
        <div class="rounded-2xl border border-white/5 bg-[#1d1b1a] p-5">
          <span class="text-[10px] uppercase tracking-widest text-gold-300/40">Temperatur</span>
          <p :class="tempColor(data.temperature)" class="mt-2 font-serif text-3xl italic">
            {{ data.temperature ? `${data.temperature.toFixed(1)}°` : '—' }}
          </p>
        </div>

        <!-- CPU Load -->
        <div class="rounded-2xl border border-white/5 bg-[#1d1b1a] p-5">
          <span class="text-[10px] uppercase tracking-widest text-gold-300/40">CPU Load</span>
          <p class="mt-2 font-serif text-3xl italic text-neutral-50">
            {{ data.cpu.load1m.toFixed(2) }}
          </p>
          <p class="mt-1 text-xs text-neutral-200/40">
            {{ data.cpu.cores }} Cores
          </p>
        </div>

        <!-- Memory -->
        <div class="rounded-2xl border border-white/5 bg-[#1d1b1a] p-5">
          <span class="text-[10px] uppercase tracking-widest text-gold-300/40">RAM</span>
          <p :class="usageColor(data.memory.usedPercent)" class="mt-2 font-serif text-3xl italic">
            {{ data.memory.usedPercent }}%
          </p>
          <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              :class="usageBarColor(data.memory.usedPercent)"
              :style="{ width: `${data.memory.usedPercent}%` }"
              class="h-full transition-all"
            />
          </div>
          <p class="mt-1 text-xs text-neutral-200/40">
            {{ formatBytes(data.memory.used) }} / {{ formatBytes(data.memory.total) }}
          </p>
        </div>

        <!-- Disk -->
        <div class="rounded-2xl border border-white/5 bg-[#1d1b1a] p-5">
          <span class="text-[10px] uppercase tracking-widest text-gold-300/40">Disk</span>
          <p :class="usageColor(data.disk.usedPercent)" class="mt-2 font-serif text-3xl italic">
            {{ data.disk.usedPercent }}%
          </p>
          <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              :class="usageBarColor(data.disk.usedPercent)"
              :style="{ width: `${data.disk.usedPercent}%` }"
              class="h-full transition-all"
            />
          </div>
          <p class="mt-1 text-xs text-neutral-200/40">
            {{ formatBytes(data.disk.used) }} / {{ formatBytes(data.disk.total) }}
          </p>
        </div>
      </div>

      <!-- Uptime -->
      <div v-if="data" class="mt-4 rounded-2xl border border-white/5 bg-[#1d1b1a] p-5">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] uppercase tracking-widest text-gold-300/40">Uptime</span>
            <p class="mt-1 text-lg text-neutral-50">
              {{ formatUptime(data.uptime) }}
            </p>
          </div>
          <div class="text-right">
            <span class="text-[10px] uppercase tracking-widest text-gold-300/40">CPU Load (5m / 15m)</span>
            <p class="mt-1 text-sm tabular-nums text-neutral-200">
              {{ data.cpu.load5m.toFixed(2) }} / {{ data.cpu.load15m.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="py-12 text-center text-neutral-200/40">
        Lade Systemdaten...
      </div>
    </div>
  </div>
</template>
