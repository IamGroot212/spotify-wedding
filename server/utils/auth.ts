import type { H3Event } from 'h3';
import { randomBytes } from 'node:crypto';
import { eq, lt } from 'drizzle-orm';

const SESSION_COOKIE = 'admin_session';
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

export function verifyAdminPassword(password: string): boolean {
  const config = useRuntimeConfig();
  const adminPassword = config.adminPassword;
  if (!adminPassword)
    return false;
  return password === adminPassword;
}

export function createAdminSession(event: H3Event): string {
  const token = randomBytes(32).toString('hex');

  db.insert(schema.adminSessions).values({
    token,
  }).run();

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
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

  const session = db.query.adminSessions.findFirst({
    where: eq(schema.adminSessions.token, token),
  });

  // Drizzle findFirst is sync with better-sqlite3
  const result = session as unknown as { createdAt: Date; token: string } | undefined;
  if (!result)
    return false;

  if (Date.now() - result.createdAt.getTime() > MAX_AGE_MS) {
    db.delete(schema.adminSessions).where(eq(schema.adminSessions.token, token)).run();
    return false;
  }

  return true;
}

export function clearAdminSession(event: H3Event): void {
  const token = getCookie(event, SESSION_COOKIE);
  if (token) {
    db.delete(schema.adminSessions).where(eq(schema.adminSessions.token, token)).run();
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' });
}

export function cleanExpiredSessions(): void {
  const cutoff = new Date(Date.now() - MAX_AGE_MS);
  db.delete(schema.adminSessions).where(lt(schema.adminSessions.createdAt, cutoff)).run();
}
