<script setup lang="ts">
definePageMeta({ middleware: 'admin' });

const toast = useToast();
const isResetting = ref(false);
const confirmed = ref(false);

async function handleReset() {
  if (!confirmed.value) {
    confirmed.value = true;
    return;
  }

  isResetting.value = true;
  try {
    const data = await $fetch<{ message: string }>('/api/admin/reset-stats', {
      method: 'POST',
    });
    toast.add({ color: 'success', title: data.message });
    confirmed.value = false;
  }
  catch {
    toast.add({ color: 'error', title: 'Reset fehlgeschlagen' });
  }
  finally {
    isResetting.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-svh items-center justify-center bg-[#141312] px-6">
    <div class="w-full max-w-sm text-center">
      <h1 class="mb-2 font-serif text-2xl italic text-gold-200">
        Stats zurücksetzen
      </h1>
      <p class="mb-8 text-sm text-neutral-200/60">
        Löscht alle Songvorschläge aus der Datenbank.
      </p>

      <button
        v-if="!confirmed"
        class="w-full rounded-xl bg-[#93000a]/30 py-4 font-semibold text-[#ffb4ab] transition-transform active:scale-95"
        @click="handleReset"
      >
        Alle Vorschläge löschen
      </button>

      <div v-else class="space-y-3">
        <p class="text-sm font-medium text-[#ffb4ab]">
          Bist du sicher? Das kann nicht rückgängig gemacht werden.
        </p>
        <div class="flex gap-3">
          <button
            :disabled="isResetting"
            class="flex-1 rounded-xl bg-[#93000a] py-3 font-semibold text-[#ffb4ab] transition-transform active:scale-95 disabled:opacity-50"
            @click="handleReset"
          >
            {{ isResetting ? 'Wird gelöscht...' : 'Ja, löschen' }}
          </button>
          <button
            class="flex-1 rounded-xl border border-white/10 py-3 font-medium text-neutral-200/60 transition-transform active:scale-95"
            @click="confirmed = false"
          >
            Abbrechen
          </button>
        </div>
      </div>

      <NuxtLink
        class="mt-8 inline-block text-xs text-gold-300/40 transition-colors hover:text-gold-300"
        to="/admin"
      >
        ← Zurück zum Dashboard
      </NuxtLink>
    </div>
  </div>
</template>
