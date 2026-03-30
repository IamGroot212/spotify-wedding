<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';

type SongRequest = {
  album: string | null;
  artist: string;
  coverUrl: string | null;
  createdAt: string;
  id: number;
  requestedBy: string | null;
  spotifyTrackId: string;
  spotifyUri: string;
  status: 'approved' | 'pending' | 'played' | 'queued' | 'rejected';
  title: string;
};

const statusFilter = ref<string>('pending');

const { data, refresh, status: fetchStatus } = useFetch<{ requests: SongRequest[] }>('/api/requests', {
  params: computed(() => ({ status: statusFilter.value })),
  server: false,
});

const config = useRuntimeConfig();
const { pause, resume } = useIntervalFn(refresh, config.public.pollingIntervals.adminRefresh, { immediate: false });
onMounted(() => resume());
onUnmounted(() => pause());

const toast = useToast();
const processingId = ref<number | null>(null);

async function updateStatus(id: number, status: 'approved' | 'queued' | 'rejected') {
  processingId.value = id;
  try {
    await $fetch(`/api/requests/${id}`, {
      body: { status },
      method: 'PATCH',
    });
    toast.add({
      color: 'success',
      title: status === 'queued'
        ? 'Zur Queue hinzugefügt'
        : status === 'approved'
          ? 'Genehmigt'
          : 'Abgelehnt',
    });
    await refresh();
  }
  catch (err: unknown) {
    const message = err && typeof err === 'object' && 'data' in err
      ? (err.data as { message?: string })?.message || 'Aktion fehlgeschlagen'
      : 'Aktion fehlgeschlagen';
    toast.add({ color: 'error', description: message, title: 'Fehler' });
  }
  finally {
    processingId.value = null;
  }
}

const statusOptions = [
  { label: 'Ausstehend', value: 'pending' },
  { label: 'Genehmigt', value: 'approved' },
  { label: 'In Queue', value: 'queued' },
  { label: 'Abgelehnt', value: 'rejected' },
  { label: 'Gespielt', value: 'played' },
  { label: 'Alle', value: 'all' },
];

const statusColors: Record<string, 'error' | 'info' | 'neutral' | 'success' | 'warning'> = {
  approved: 'info',
  pending: 'warning',
  played: 'neutral',
  queued: 'success',
  rejected: 'error',
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="opt in statusOptions"
        :key="opt.value"
        :color="statusFilter === opt.value ? 'primary' : 'neutral'"
        :variant="statusFilter === opt.value ? 'solid' : 'outline'"
        size="sm"
        @click="statusFilter = opt.value"
      >
        {{ opt.label }}
      </UButton>
    </div>

    <div v-if="fetchStatus === 'pending' && !data" class="space-y-3">
      <USkeleton v-for="i in 3" :key="i" class="h-20 w-full" />
    </div>

    <div v-else-if="data?.requests.length" class="space-y-3">
      <div
        v-for="req in data.requests"
        :key="req.id"
        class="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
      >
        <img
          v-if="req.coverUrl"
          :alt="req.title"
          :src="req.coverUrl"
          class="size-12 shrink-0 rounded"
        >

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate font-medium">
                {{ req.title }}
              </p>
              <p class="truncate text-sm text-neutral-500">
                {{ req.artist }}
              </p>
            </div>
            <UBadge
              :color="statusColors[req.status] || 'neutral'"
              size="xs"
              variant="subtle"
            >
              {{ req.status }}
            </UBadge>
          </div>

          <div class="mt-1 flex items-center gap-2 text-xs text-neutral-400">
            <span v-if="req.requestedBy">von {{ req.requestedBy }}</span>
            <span>{{ formatTime(req.createdAt) }}</span>
          </div>

          <div v-if="req.status === 'pending'" class="mt-2 flex gap-2">
            <UButton
              :disabled="processingId === req.id"
              :loading="processingId === req.id"
              color="primary"
              icon="i-lucide-check"
              size="xs"
              @click="updateStatus(req.id, 'queued')"
            >
              Annehmen
            </UButton>
            <UButton
              :disabled="processingId === req.id"
              color="error"
              icon="i-lucide-x"
              size="xs"
              variant="outline"
              @click="updateStatus(req.id, 'rejected')"
            >
              Ablehnen
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="py-6 text-center text-sm text-neutral-400">
      Keine Vorschläge für diesen Filter
    </p>
  </div>
</template>
