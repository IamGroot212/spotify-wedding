import type { H3Event } from 'h3';
import { randomBytes } from 'node:crypto';

const SESSION_COOKIE = 'admin_session';
const MAX_AGE_SECONDS = 12 * 60 * 60; // 12 hours

export function verifyAdminPassword(password: string): boolean {
  const config = useRuntimeConfig();
  const adminPassword = config.adminPassword;
  if (!adminPassword)
    return false;
  return password === adminPassword;
}

export function createAdminSession(event: H3Event): string {
  const token = randomBytes(32).toString('hex');
  const sqlite = useSqlite();

  sqlite.prepare('INSERT INTO admin_sessions (token, created_at) VALUES (?, unixepoch())').run(token);

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: true,
  });

  return token;
}

export function isAdminAuthenticated(event: H3Event): boolean {
  const token = getCookie(event, SESSION_COOKIE);
  if (!token)
    return false;

  const sqlite = useSqlite();
  const row = sqlite.prepare('SELECT created_at FROM admin_sessions WHERE token = ?').get(token) as { created_at: number } | undefined;

  if (!row)
    return false;

  const ageSeconds = Math.floor(Date.now() / 1000) - row.created_at;
  if (ageSeconds > MAX_AGE_SECONDS) {
    sqlite.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    return false;
  }

  return true;
}

export function clearAdminSession(event: H3Event): void {
  const token = getCookie(event, SESSION_COOKIE);
  if (token) {
    const sqlite = useSqlite();
    sqlite.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' });
}
