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
  <div class="flex min-h-svh items-center justify-center px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h1 class="text-center text-xl font-bold">
          Admin-Login
        </h1>
      </template>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <UFormField label="Passwort">
          <UInput
            v-model="password"
            autocomplete="current-password"
            placeholder="Admin-Passwort"
            size="lg"
            type="password"
          />
        </UFormField>

        <UAlert
          v-if="error"
          :description="error"
          color="error"
          icon="i-lucide-alert-circle"
        />

        <UButton
          :loading="isLoading"
          block
          color="primary"
          size="lg"
          type="submit"
        >
          Anmelden
        </UButton>
      </form>
    </UCard>
  </div>
</template>
