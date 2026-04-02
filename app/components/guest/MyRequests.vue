<script setup lang="ts">
const { sessionId } = useGuestSession();

const { data, refresh } = useFetch<{
  requests: Array<{
    artist: string;
    coverUrl: string | null;
    id: number;
    status: string;
    title: string;
  }>;
}>('/api/requests/mine', {
  params: computed(() => ({ sessionId: sessionId.value })),
  server: false,
  watch: [sessionId],
});

// Refresh periodically
const interval = ref<ReturnType<typeof setInterval>>();
onMounted(() => {
  interval.value = setInterval(refresh, 10000);
});
onUnmounted(() => {
  if (interval.value)
    clearInterval(interval.value);
});

// Expose refresh for parent to call
defineExpose({ refresh });

const statusLabel: Record<string, string> = {
  approved: 'Genehmigt',
  pending: 'Wird geprüft',
  played: 'Gespielt',
  queued: 'In Queue',
  rejected: 'Abgelehnt',
};

const statusColor: Record<string, string> = {
  approved: 'text-emerald-400',
  pending: 'text-gold-300',
  played: 'text-neutral-300',
  queued: 'text-emerald-400',
  rejected: 'text-[#ffb4ab]',
};
</script>

<template>
  <div v-if="data?.requests.length">
    <h3 class="mb-3 text-[10px] font-medium uppercase tracking-[0.1em] text-neutral-200">
      Deine Vorschläge
    </h3>
    <div class="space-y-2">
      <div
        v-for="req in data.requests"
        :key="req.id"
        class="flex items-center gap-3 rounded-xl bg-[#1d1b1a] p-2.5"
      >
        <img
          v-if="req.coverUrl"
          :alt="req.title"
          :src="req.coverUrl"
          class="size-8 shrink-0 rounded-lg object-cover"
        >
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm text-neutral-50">
            {{ req.title }}
          </p>
        </div>
        <span
          :class="statusColor[req.status] || 'text-neutral-300'"
          class="shrink-0 text-[10px] font-medium uppercase tracking-wider"
        >
          {{ statusLabel[req.status] || req.status }}
        </span>
      </div>
    </div>
  </div>
</template>
