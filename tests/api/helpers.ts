// Test against the running local server
// Make sure the dev server or production server is running on this port
export const BASE_URL = 'http://127.0.0.1:3002';

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<{ data: T; status: number }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  let data: T;
  try {
    data = await res.json() as T;
  }
  catch {
    data = undefined as T;
  }

  return { data, status: res.status };
}

export async function loginAsAdmin(password = 'BCJHQCS87t5TXb2eSNVSzw'): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    body: JSON.stringify({ password }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  const cookie = res.headers.get('set-cookie');
  if (!cookie)
    throw new Error('No session cookie returned');
  return cookie.split(';')[0];
}
