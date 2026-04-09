<script setup lang="ts">
const route = useRoute();

const navItems = [
  { icon: 'i-lucide-layout-dashboard', label: 'Requests', to: '/admin' },
  { icon: 'i-lucide-list-music', label: 'Queue', to: '/admin/queue' },
  { icon: 'i-lucide-settings', label: 'Settings', to: '/admin/settings' },
];

function isActive(to: string): boolean {
  if (to === '/admin')
    return route.path === '/admin';
  return route.path.startsWith(to);
}

async function handleLogout() {
  await $fetch('/api/admin/logout', { method: 'POST' });
  await navigateTo('/admin/login');
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-[#141312]">
    <div class="flex items-center justify-between px-6 py-4">
      <h1 class="font-serif text-xl italic text-gold-300">
        Admin Concierge
      </h1>
      <div class="flex items-center gap-3">
        <AdminSpotifyStatus />
        <button
          class="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200/60 transition-colors hover:bg-white/5 hover:text-neutral-200"
          @click="handleLogout"
        >
          <UIcon class="size-4" name="i-lucide-log-out" />
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex gap-1 px-6 pb-3">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :class="isActive(item.to)
          ? 'bg-gold-300/10 text-gold-300 border-gold-300/20'
          : 'text-neutral-200/40 border-transparent hover:text-neutral-200/60 hover:bg-white/5'"
        :to="item.to"
        class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
      >
        <UIcon :name="item.icon" class="size-3.5" />
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>
