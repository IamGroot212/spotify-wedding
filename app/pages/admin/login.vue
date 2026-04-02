<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { login } = useAdminAuth();
const password = ref('');
const error = ref('');
const isLoading = ref(false);

async function handleLogin() {
  error.value = '';
  isLoading.value = true;
  const success = await login(password.value);
  if (success) {
    await navigateTo('/admin');
  }
  else {
    error.value = 'Falsches Passwort';
  }
  isLoading.value = false;
}
</script>

<template>
  <div class="flex min-h-svh items-center justify-center bg-[#141312] px-6">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <h1 class="font-serif text-3xl italic text-gold-200">
          Admin Concierge
        </h1>
        <p class="mt-2 text-sm text-neutral-200/40">
          Zugang zum Dashboard
        </p>
      </div>

      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <input
            v-model="password"
            autocomplete="current-password"
            class="w-full rounded-xl border-none bg-neutral-500 px-4 py-4 text-base text-neutral-50 transition-all placeholder:text-neutral-200/40 focus:bg-neutral-400 focus:ring-1 focus:ring-gold-300/20"
            placeholder="Passwort"
            type="password"
          >
        </div>

        <div
          v-if="error"
          class="rounded-xl bg-[#93000a]/20 px-4 py-3 text-sm text-[#ffb4ab]"
        >
          {{ error }}
        </div>

        <button
          :disabled="isLoading"
          class="flex w-full items-center justify-center rounded-xl bg-gold-300 py-4 font-semibold text-[#6a5314] shadow-[0px_10px_30px_rgba(106,83,20,0.3)] transition-transform duration-150 active:scale-95 disabled:opacity-50"
          type="submit"
        >
          {{ isLoading ? 'Wird geprüft...' : 'Anmelden' }}
        </button>
      </form>
    </div>
  </div>
</template>
