<script setup lang="ts">
defineProps<{
  isConnected: boolean;
}>();
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="!isConnected"
      class="mx-4 mb-3 flex items-center gap-3 rounded-xl bg-[#93000a]/20 px-4 py-3"
    >
      <UIcon class="size-5 shrink-0 text-[#ffb4ab]" name="i-lucide-wifi-off" />
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-[#ffb4ab]">
          Spotify nicht verbunden
        </p>
        <p class="text-xs text-[#ffb4ab]/60">
          Songsuche ist momentan nicht verfügbar. Bitte kurz warten.
        </p>
      </div>
    </div>
  </Transition>
</template>
