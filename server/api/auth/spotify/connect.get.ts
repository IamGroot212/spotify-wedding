import { randomBytes } from 'node:crypto';

export default defineEventHandler((event) => {
  if (!isAdminAuthenticated(event)) {
    throw createError({ message: 'Nicht autorisiert', statusCode: 401 });
  }

  const state = randomBytes(16).toString('hex');

  // Store state in cookie for verification
  setCookie(event, 'spotify_oauth_state', state, {
    httpOnly: true,
    maxAge: 600, // 10 minutes
    path: '/',
    sameSite: 'lax',
  });

  const authUrl = getAuthUrl(state);
  return sendRedirect(event, authUrl);
});
