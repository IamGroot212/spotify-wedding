<script setup lang="ts">
const emit = defineEmits<{
  enter: [];
}>();

const visible = ref(true);

function handleEnter() {
  visible.value = false;
  emit('enter');
}
</script>

<template>
  <Transition
    leave-active-class="transition-opacity duration-500"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#141312] px-8"
    >
      <!-- Ambient glow -->
      <div class="ambient-glow pointer-events-none absolute left-1/2 top-1/3 size-96 -translate-x-1/2 -translate-y-1/2" />

      <div class="relative z-10 text-center">
        <p class="mb-2 text-[10px] uppercase tracking-[0.2em] text-gold-300/50">
          Willkommen zur Feier
        </p>

        <h1 class="font-serif text-4xl italic leading-tight text-gold-200">
          The Midnight<br>Concierge
        </h1>

        <p class="mt-6 max-w-xs text-sm leading-relaxed text-neutral-200/60">
          Wünsch dir deinen Lieblingssong und wir spielen ihn für dich.
        </p>

        <button
          class="mt-10 rounded-xl bg-gold-300 px-8 py-4 font-semibold text-[#6a5314] shadow-[0px_10px_30px_rgba(106,83,20,0.3)] transition-transform duration-150 active:scale-95"
          @click="handleEnter"
        >
          Songs entdecken
        </button>
      </div>

      <p class="absolute bottom-8 text-[10px] uppercase tracking-[0.15em] text-neutral-200/20">
        camavor.de
      </p>
    </div>
  </Transition>
</template>
