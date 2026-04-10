<script setup lang="ts">
definePageMeta({ middleware: 'admin' });

type Settings = {
  cooldownSeconds: number;
  duplicateWindowMinutes: number;
  explicitFilterEnabled: boolean;
  maxRequestsPerGuest: number;
  noRepeatsAllNight: boolean;
  queueSchedulerEnabled: boolean;
  requireApproval: boolean;
};

const toast = useToast();
const { data, refresh } = useFetch<{ settings: Settings }>('/api/admin/settings', { server: false });
const saving = ref(false);

async function updateSetting(key: keyof Settings, value: boolean | number) {
  saving.value = true;
  try {
    await $fetch('/api/admin/settings', {
      body: { [key]: value },
      method: 'PATCH',
    });
    await refresh();
    toast.add({ color: 'success', title: 'Einstellung gespeichert' });
  }
  catch {
    toast.add({ color: 'error', title: 'Fehler beim Speichern' });
  }
  finally {
    saving.value = false;
  }
}

// Blocklist
const blockType = ref<'artist' | 'track'>('artist');
const blockValue = ref('');
const blockSearch = ref('');
const blockResults = ref<Array<{ artist: string; coverUrl: string | null; id: string; title: string }>>([]);

const { data: blocklistData, refresh: refreshBlocklist } = useFetch<{
  items: Array<{ id: number; type: string; value: string }>;
}>('/api/admin/blocklist', { server: false });

let blockSearchTimeout: ReturnType<typeof setTimeout> | undefined;
function searchForBlock() {
  clearTimeout(blockSearchTimeout);
  if (blockSearch.value.length < 2) {
    blockResults.value = [];
    return;
  }
  blockSearchTimeout = setTimeout(async () => {
    try {
      const results = await $fetch<Array<{ artist: string; coverUrl: string | null; id: string; title: string }>>('/api/spotify/search', {
        params: { limit: 5, q: blockSearch.value },
      });
      blockResults.value = results;
    }
    catch {
      blockResults.value = [];
    }
  }, 400);
}

async function blockFromResult(result: { artist: string }) {
  try {
    await $fetch('/api/admin/blocklist', {
      body: { type: 'artist', value: result.artist.trim() },
      method: 'POST',
    });
    blockSearch.value = '';
    blockResults.value = [];
    await refreshBlocklist();
    toast.add({ color: 'success', title: `"${result.artist}" gesperrt` });
  }
  catch {
    toast.add({ color: 'error', title: 'Fehler beim Sperren' });
  }
}

async function addToBlocklist() {
  if (!blockValue.value.trim())
    return;
  try {
    await $fetch('/api/admin/blocklist', {
      body: { type: blockType.value, value: blockValue.value.trim() },
      method: 'POST',
    });
    blockValue.value = '';
    await refreshBlocklist();
    toast.add({ color: 'success', title: 'Zur Blocklist hinzugefügt' });
  }
  catch {
    toast.add({ color: 'error', title: 'Fehler beim Hinzufügen' });
  }
}

async function removeFromBlocklist(id: number) {
  try {
    await $fetch(`/api/admin/blocklist/${id}`, { method: 'DELETE' });
    await refreshBlocklist();
  }
  catch {
    toast.add({ color: 'error', title: 'Fehler beim Entfernen' });
  }
}
</script>

<template>
  <div class="min-h-svh bg-[#141312]">
    <AdminHeader />

    <div v-if="data?.settings" class="mx-auto max-w-2xl space-y-6 px-6 py-4">
      <!-- Moderation -->
      <div class="rounded-2xl border border-white/5 bg-[#1d1b1a] p-6">
        <h2 class="mb-4 text-xs font-medium uppercase tracking-widest text-gold-300/40">
          Moderation
        </h2>
        <div class="space-y-5">
          <USwitch
            :model-value="data.settings.requireApproval"
            label="Freigabe erforderlich"
            description="Songs müssen im Admin genehmigt werden"
            @update:model-value="updateSetting('requireApproval', $event)"
          />

          <USwitch
            :model-value="data.settings.noRepeatsAllNight"
            label="Keine Wiederholungen"
            description="Jeder Song kann nur einmal pro Abend vorgeschlagen werden"
            @update:model-value="updateSetting('noRepeatsAllNight', $event)"
          />

          <USwitch
            :model-value="data.settings.explicitFilterEnabled"
            label="Explicit-Filter"
            description="Songs mit expliziten Inhalten blockieren"
            @update:model-value="updateSetting('explicitFilterEnabled', $event)"
          />

          <USwitch
            :model-value="data.settings.queueSchedulerEnabled"
            label="Queue-Scheduler"
            description="Songs getaktet einfügen — wartet bis Queue fast leer ist bevor der nächste Song hinzugefügt wird"
            @update:model-value="updateSetting('queueSchedulerEnabled', $event)"
          />
        </div>
      </div>

      <!-- Rate Limiting -->
      <div class="rounded-2xl border border-white/5 bg-[#1d1b1a] p-6">
        <h2 class="mb-4 text-xs font-medium uppercase tracking-widest text-gold-300/40">
          Rate Limiting
        </h2>
        <div class="space-y-5">
          <div>
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-neutral-50">
                Duplikat-Zeitfenster
              </p>
              <span class="text-sm tabular-nums text-gold-300">
                {{ data.settings.duplicateWindowMinutes }} Min
              </span>
            </div>
            <p class="mb-3 text-xs text-neutral-200/60">
              Zeitfenster in dem derselbe Song nicht erneut vorgeschlagen werden kann (nur aktiv wenn "Keine Wiederholungen" aus)
            </p>
            <input
              :value="data.settings.duplicateWindowMinutes"
              class="w-full accent-gold-300"
              max="240"
              min="5"
              type="range"
              @change="updateSetting('duplicateWindowMinutes', Number(($event.target as HTMLInputElement).value))"
            >
          </div>

          <div>
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-neutral-50">
                Max. Vorschläge pro Gast
              </p>
              <span class="text-sm tabular-nums text-gold-300">
                {{ data.settings.maxRequestsPerGuest }}
              </span>
            </div>
            <p class="mb-3 text-xs text-neutral-200/60">
              Maximale Anzahl offener Vorschläge pro Gast
            </p>
            <input
              :value="data.settings.maxRequestsPerGuest"
              class="w-full accent-gold-300"
              max="50"
              min="1"
              type="range"
              @change="updateSetting('maxRequestsPerGuest', Number(($event.target as HTMLInputElement).value))"
            >
          </div>
        </div>
      </div>

      <!-- Blocklist -->
      <div class="rounded-2xl border border-white/5 bg-[#1d1b1a] p-6">
        <h2 class="mb-4 text-xs font-medium uppercase tracking-widest text-gold-300/40">
          Blocklist
        </h2>

        <!-- Search + Add -->
        <div class="relative mb-4">
          <input
            v-model="blockSearch"
            class="w-full rounded-lg border-none bg-neutral-500 px-3 py-2 text-base text-neutral-50 placeholder:text-neutral-200/40"
            placeholder="Interpret oder Song suchen..."
            @input="searchForBlock"
          >

          <!-- Search Results Dropdown -->
          <div
            v-if="blockResults.length"
            class="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#211f1e] shadow-2xl"
          >
            <button
              v-for="result in blockResults"
              :key="result.id"
              class="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/5"
              @click="blockFromResult(result)"
            >
              <img
                v-if="result.coverUrl"
                :src="result.coverUrl"
                class="size-8 rounded object-cover"
              >
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm text-neutral-50">
                  {{ result.title }}
                </p>
                <p class="truncate text-xs text-neutral-200/60">
                  {{ result.artist }}
                </p>
              </div>
              <div class="flex shrink-0 gap-1">
                <span
                  class="rounded bg-[#93000a]/30 px-2 py-0.5 text-[10px] text-[#ffb4ab] transition-colors hover:bg-[#93000a]/50"
                >
                  Interpret sperren
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- Manual add -->
        <div class="mb-4 flex gap-2">
          <select
            v-model="blockType"
            class="rounded-lg border-none bg-neutral-500 px-3 py-2 text-sm text-neutral-50"
          >
            <option value="artist">
              Interpret
            </option>
            <option value="track">
              Track-ID
            </option>
          </select>
          <input
            v-model="blockValue"
            class="min-w-0 flex-1 rounded-lg border-none bg-neutral-500 px-3 py-2 text-base text-neutral-50 placeholder:text-neutral-200/40"
            placeholder="Manuell eingeben..."
            @keyup.enter="addToBlocklist"
          >
          <button
            class="shrink-0 rounded-lg bg-gold-300 px-4 py-2 text-sm font-bold text-[#6a5314] transition-all active:scale-95"
            @click="addToBlocklist"
          >
            Sperren
          </button>
        </div>

        <!-- Blocklist items -->
        <div v-if="blocklistData?.items.length" class="space-y-2">
          <div
            v-for="item in blocklistData.items"
            :key="item.id"
            class="flex items-center justify-between rounded-lg bg-neutral-500/50 px-3 py-2"
          >
            <div class="flex items-center gap-2">
              <span class="rounded bg-neutral-400 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-neutral-100">
                {{ item.type === 'artist' ? 'Interpret' : 'Track' }}
              </span>
              <span class="text-sm text-neutral-50">{{ item.value }}</span>
            </div>
            <button
              class="text-[#ffb4ab]/60 transition-colors hover:text-[#ffb4ab]"
              @click="removeFromBlocklist(item.id)"
            >
              <UIcon class="size-4" name="i-lucide-x" />
            </button>
          </div>
        </div>
        <p v-else class="text-sm text-neutral-200/40">
          Keine Einträge gesperrt
        </p>
      </div>

      <!-- Danger Zone -->
      <div class="rounded-2xl border border-[#ffb4ab]/10 bg-[#93000a]/10 p-6">
        <h2 class="mb-4 text-xs font-medium uppercase tracking-widest text-[#ffb4ab]/40">
          Gefahrenzone
        </h2>
        <NuxtLink
          class="flex items-center gap-2 text-sm text-[#ffb4ab] transition-colors hover:text-[#ffb4ab]/80"
          to="/admin/reset-stats"
        >
          <UIcon class="size-4" name="i-lucide-trash-2" />
          Alle Vorschläge zurücksetzen
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
