<script setup lang="ts">
import QRCode from 'qrcode';

const config = useRuntimeConfig();
const url = config.public.baseUrl || 'https://camavor.de';

const qrDataUrl = ref('');

onMounted(async () => {
  qrDataUrl.value = await QRCode.toDataURL(url, {
    color: {
      dark: '#e8c97e',
      light: '#141312',
    },
    margin: 2,
    width: 400,
  });
});
</script>

<template>
  <div class="flex min-h-svh flex-col items-center justify-center bg-[#141312] px-8 py-12 text-center">
    <h1 class="mb-2 font-serif text-3xl italic text-gold-200">
      The Midnight Concierge
    </h1>
    <p class="mb-8 text-sm text-neutral-200/60">
      Scanne den Code und wünsch dir einen Song
    </p>

    <div v-if="qrDataUrl" class="rounded-2xl bg-neutral-600 p-6">
      <img
        :src="qrDataUrl"
        alt="QR-Code zu camavor.de"
        class="size-64"
      >
    </div>

    <p class="mt-6 text-xs uppercase tracking-[0.15em] text-gold-300/50">
      {{ url.replace('https://', '') }}
    </p>
  </div>
</template>
