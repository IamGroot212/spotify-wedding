export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin') || to.path === '/admin/login')
    return;

  try {
    // Forward browser cookies during SSR so the session check works
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : {};
    const data = await $fetch<{ authenticated: boolean }>('/api/admin/session', { headers });
    if (!data.authenticated) {
      return navigateTo('/admin/login');
    }
  }
  catch {
    return navigateTo('/admin/login');
  }
});
