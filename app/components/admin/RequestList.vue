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
const selectedIds = ref(new Set<number>());
const bulkProcessing = ref(false);

const allSelected = computed(() => {
  const pending = data.value?.requests.filter(r => r.status === 'pending') || [];
  return pending.length > 0 && pending.every(r => selectedIds.value.has(r.id));
});

function toggleAll() {
  const pending = data.value?.requests.filter(r => r.status === 'pending') || [];
  if (allSelected.value) {
    selectedIds.value.clear();
  }
  else {
    pending.forEach(r => selectedIds.value.add(r.id));
  }
}

function toggleSelect(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  }
  else {
    selectedIds.value.add(id);
  }
}

async function bulkAction(status: 'queued' | 'rejected') {
  if (selectedIds.value.size === 0)
    return;
  bulkProcessing.value = true;
  try {
    const result = await $fetch<{ message: string }>('/api/requests/bulk', {
      body: { ids: [...selectedIds.value], status },
      method: 'PATCH',
    });
    toast.add({ color: 'success', title: result.message });
    selectedIds.value.clear();
    await refresh();
  }
  catch (err: unknown) {
    const message = err && typeof err === 'object' && 'data' in err
      ? (err.data as { message?: string })?.message || 'Bulk-Aktion fehlgeschlagen'
      : 'Bulk-Aktion fehlgeschlagen';
    toast.add({ color: 'error', description: message, title: 'Fehler' });
  }
  finally {
    bulkProcessing.value = false;
  }
}

async function updateStatus(id: number, status: 'queued' | 'rejected') {
  processingId.value = id;
  try {
    await $fetch(`/api/requests/${id}`, {
      body: { status },
      method: 'PATCH',
    });
    toast.add({
      color: 'success',
      title: status === 'queued' ? 'Zur Queue hinzugefügt' : 'Abgelehnt',
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
  { label: 'In Queue', value: 'queued' },
  { label: 'Abgelehnt', value: 'rejected' },
  { label: 'Alle', value: 'all' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1)
    return 'gerade eben';
  if (min < 60)
    return `vor ${min} Min`;
  const hours = Math.floor(min / 60);
  return `vor ${hours} Std`;
}

const pendingCount = computed(() =>
  statusFilter.value === 'pending' ? data.value?.requests.length || 0 : null,
);

// Clear selection when filter changes
watch(statusFilter, () => selectedIds.value.clear());
</script>

<template>
  <div class="space-y-6">
    <!-- Filter Tabs -->
    <div class="flex gap-2">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        :class="statusFilter === opt.value
          ? 'bg-gold-300 text-[#6a5314] font-bold'
          : 'bg-transparent text-gold-200/40 border border-white/10 hover:bg-white/5'"
        class="rounded-lg px-4 py-2 text-xs uppercase tracking-wider transition-all"
        @click="statusFilter = opt.value"
      >
        {{ opt.label }}
        <span
          v-if="opt.value === 'pending' && pendingCount"
          class="ml-1 rounded-md bg-[#6a5314]/30 px-1.5 py-0.5 text-[10px]"
        >
          {{ pendingCount }}
        </span>
      </button>
    </div>

    <!-- Bulk Actions Bar -->
    <div
      v-if="statusFilter === 'pending' && data?.requests.length"
      class="flex items-center gap-3"
    >
      <button
        class="flex items-center gap-2 text-xs text-neutral-200/60 transition-colors hover:text-neutral-200"
        @click="toggleAll"
      >
        <div
          :class="allSelected ? 'bg-gold-300 border-gold-300' : 'border-white/20'"
          class="flex size-4 items-center justify-center rounded border transition-colors"
        >
          <UIcon v-if="allSelected" class="size-3 text-[#6a5314]" name="i-lucide-check" />
        </div>
        Alle auswählen
      </button>

      <template v-if="selectedIds.size > 0">
        <span class="text-xs text-gold-300/40">{{ selectedIds.size }} ausgewählt</span>
        <button
          :disabled="bulkProcessing"
          class="rounded-lg bg-gold-300 px-3 py-1 text-xs font-bold text-[#6a5314] transition-all active:scale-95 disabled:opacity-50"
          @click="bulkAction('queued')"
        >
          Alle annehmen
        </button>
        <button
          :disabled="bulkProcessing"
          class="rounded-lg border border-white/10 px-3 py-1 text-xs text-gold-200/60 transition-all hover:bg-white/5 disabled:opacity-50"
          @click="bulkAction('rejected')"
        >
          Alle ablehnen
        </button>
      </template>
    </div>

    <!-- Loading -->
    <div v-if="fetchStatus === 'pending' && !data" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-neutral-600" />
    </div>

    <!-- Request Cards -->
    <div v-else-if="data?.requests.length" class="space-y-4">
      <div
        v-for="req in data.requests"
        :key="req.id"
        :class="selectedIds.has(req.id) ? 'ring-1 ring-gold-300/30' : ''"
        class="flex flex-col gap-4 rounded-2xl bg-[#211f1e] p-4 transition-all duration-300 hover:bg-neutral-500 md:flex-row md:items-center md:gap-6 md:p-6"
      >
        <!-- Checkbox (pending only) -->
        <button
          v-if="req.status === 'pending'"
          class="hidden shrink-0 md:block"
          @click="toggleSelect(req.id)"
        >
          <div
            :class="selectedIds.has(req.id) ? 'bg-gold-300 border-gold-300' : 'border-white/20'"
            class="flex size-5 items-center justify-center rounded border transition-colors"
          >
            <UIcon v-if="selectedIds.has(req.id)" class="size-3 text-[#6a5314]" name="i-lucide-check" />
          </div>
        </button>

        <!-- Song Info -->
        <div class="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
          <div class="relative shrink-0">
            <img
              v-if="req.coverUrl"
              :alt="req.title"
              :src="req.coverUrl"
              class="size-16 rounded-xl object-cover shadow-lg md:size-20"
            >
            <div v-else class="flex size-16 items-center justify-center rounded-xl bg-neutral-500 md:size-20">
              <UIcon class="size-6 text-neutral-300" name="i-lucide-music" />
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="truncate font-serif text-lg text-neutral-50 md:text-xl">
              {{ req.title }}
            </h3>
            <p class="text-sm font-medium text-gold-300/70">
              {{ req.artist }}<span v-if="req.album"> · {{ req.album }}</span>
            </p>
            <div class="mt-1 flex items-center gap-4 text-[10px] uppercase tracking-widest text-neutral-200">
              <span v-if="req.requestedBy" class="flex items-center gap-1">
                <UIcon class="size-3" name="i-lucide-user" />
                {{ req.requestedBy }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon class="size-3" name="i-lucide-clock" />
                {{ timeAgo(req.createdAt) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="req.status === 'pending'" class="flex items-center gap-3 md:border-l md:border-white/5 md:pl-6">
          <button
            :disabled="processingId === req.id"
            class="flex-1 rounded-xl bg-gold-300 px-6 py-3 text-sm font-bold tracking-wide text-[#6a5314] shadow-md transition-all active:scale-95 disabled:opacity-50 md:flex-none"
            @click="updateStatus(req.id, 'queued')"
          >
            {{ processingId === req.id ? '...' : 'Annehmen' }}
          </button>
          <button
            :disabled="processingId === req.id"
            class="flex-1 rounded-xl border border-white/10 bg-transparent px-6 py-3 text-sm font-medium text-gold-200/60 transition-all hover:bg-white/5 disabled:opacity-50 md:flex-none"
            @click="updateStatus(req.id, 'rejected')"
          >
            Ablehnen
          </button>
        </div>

        <!-- Status Badge (non-pending) -->
        <div v-else class="md:pl-6">
          <span
            :class="{
              'bg-emerald-500/20 text-emerald-400': req.status === 'queued',
              'bg-[#93000a]/20 text-[#ffb4ab]': req.status === 'rejected',
              'bg-neutral-500 text-neutral-200': req.status === 'played',
            }"
            class="inline-block rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider"
          >
            {{ req.status === 'queued' ? 'In Queue' : req.status === 'rejected' ? 'Abgelehnt' : req.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
      <div class="mb-4 flex size-20 items-center justify-center rounded-full bg-neutral-500 text-gold-300/20">
        <UIcon class="size-10" name="i-lucide-music-off" />
      </div>
      <h4 class="font-serif text-xl text-neutral-50">
        Keine Vorschläge
      </h4>
      <p class="mt-1 text-sm text-neutral-200/60">
        Aktuell keine Einträge für diesen Filter.
      </p>
    </div>
  </div>
</template>
