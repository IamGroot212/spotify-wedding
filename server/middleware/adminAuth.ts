export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  // Only protect /api/admin/* routes (except login and session check)
  if (!url.pathname.startsWith('/api/admin'))
    return;
  if (url.pathname === '/api/admin/login')
    return;
  if (url.pathname === '/api/admin/session')
    return;

  if (!isAdminAuthenticated(event)) {
    throw createError({ message: 'Nicht autorisiert', statusCode: 401 });
  }
});
