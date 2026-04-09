<script setup lang="ts">
definePageMeta({ middleware: 'admin' });

type Settings = {
  cooldownSeconds: number;
  duplicateWindowMinutes: number;
  explicitFilterEnabled: boolean;
  maxRequestsPerGuest: number;
  noRepeatsAllNight: boolean;
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
