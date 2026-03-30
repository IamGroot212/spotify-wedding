export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin') || to.path === '/admin/login')
    return;

  try {
    const data = await $fetch<{ authenticated: boolean }>('/api/admin/session');
    if (!data.authenticated) {
      return navigateTo('/admin/login');
    }
  }
  catch {
    return navigateTo('/admin/login');
  }
});
