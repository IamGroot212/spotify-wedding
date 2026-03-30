import type { H3Event } from 'h3';
import { randomBytes } from 'node:crypto';

const SESSION_COOKIE = 'admin_session';
const sessions = new Map<string, { createdAt: number }>();

export function verifyAdminPassword(password: string): boolean {
  const config = useRuntimeConfig();
  const adminPassword = config.adminPassword;
  if (!adminPassword)
    return false;
  return password === adminPassword;
}

export function createAdminSession(event: H3Event): string {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { createdAt: Date.now() });

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
    sameSite: 'lax',
    secure: false, // Raspberry Pi local network
  });

  return token;
}

export function isAdminAuthenticated(event: H3Event): boolean {
  const token = getCookie(event, SESSION_COOKIE);
  if (!token)
    return false;

  const session = sessions.get(token);
  if (!session)
    return false;

  // Expire after 12 hours
  const maxAge = 12 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > maxAge) {
    sessions.delete(token);
    return false;
  }

  return true;
}

export function clearAdminSession(event: H3Event): void {
  const token = getCookie(event, SESSION_COOKIE);
  if (token) {
    sessions.delete(token);
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' });
}
