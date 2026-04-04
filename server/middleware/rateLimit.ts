const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  // Only rate-limit guest submission endpoint
  if (url.pathname !== '/api/requests' || event.method !== 'POST')
    return;

  // Prefer session ID from body (parsed later), fall back to header, then IP
  const sessionId = getHeader(event, 'x-guest-session');
  const forwarded = getHeader(event, 'x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : (getHeader(event, 'x-real-ip') || 'unknown');

  // Use session ID if available, otherwise IP
  const key = sessionId || ip;
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 5;

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
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
