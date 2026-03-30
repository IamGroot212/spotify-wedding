const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(event: Parameters<typeof defineEventHandler>[0] extends (e: infer E) => unknown ? E : never): string {
  const forwarded = getHeader(event, 'x-forwarded-for');
  if (forwarded)
    return forwarded.split(',')[0].trim();
  return getHeader(event, 'x-real-ip') || 'unknown';
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  // Only rate-limit guest submission endpoint
  if (url.pathname !== '/api/requests' || event.method !== 'POST')
    return;

  const ip = getClientIp(event);
  const now = Date.now();
  const windowMs = 60_000; // 1 minute window
  const maxRequests = 5;

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count++;

  if (entry.count > maxRequests) {
    throw createError({
      message: 'Zu viele Anfragen. Bitte kurz warten.',
      statusCode: 429,
    });
  }
});
