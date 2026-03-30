import { Buffer } from 'node:buffer';
import { eq } from 'drizzle-orm';

const SPOTIFY_API = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';

const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

function getSpotifyConfig() {
  const config = useRuntimeConfig();
  return {
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
    redirectUri: config.spotifyRedirectUri,
  };
}

function basicAuth(): string {
  const { clientId, clientSecret } = getSpotifyConfig();
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
}

export function getAuthUrl(state: string): string {
  const { clientId, redirectUri } = getSpotifyConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    state,
  });
  return `${SPOTIFY_AUTH_URL}?${params}`;
}

export async function exchangeCode(code: string) {
  const { redirectUri } = getSpotifyConfig();
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
    headers: {
      'Authorization': `Basic ${basicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token exchange failed: ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
    refresh_token: string;
    token_type: string;
  }>;
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    headers: {
      'Authorization': `Basic ${basicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token refresh failed: ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  }>;
}

export async function getValidToken(): Promise<string> {
  const tokenRow = await db.query.spotifyTokens.findFirst();
  if (!tokenRow) {
    throw createError({ message: 'Spotify nicht verbunden. Bitte zuerst im Admin-Bereich verbinden.', statusCode: 503 });
  }

  const now = new Date();
  const bufferMs = 60_000; // refresh 1 min before expiry

  if (tokenRow.expiresAt.getTime() - bufferMs > now.getTime()) {
    return tokenRow.accessToken;
  }

  // Token expired or about to expire — refresh
  const refreshed = await refreshAccessToken(tokenRow.refreshToken);
  const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);

  await db.update(schema.spotifyTokens)
    .set({
      accessToken: refreshed.access_token,
      expiresAt,
      refreshToken: refreshed.refresh_token || tokenRow.refreshToken,
      updatedAt: new Date(),
    })
    .where(eq(schema.spotifyTokens.id, 1));

  return refreshed.access_token;
}

export async function spotifyFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getValidToken();
  const res = await fetch(`${SPOTIFY_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 204 || res.status === 202) {
    return undefined as T;
  }

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After') || '5';
    throw createError({
      data: { retryAfter: Number.parseInt(retryAfter) },
      message: 'Spotify Rate Limit erreicht. Bitte kurz warten.',
      statusCode: 429,
    });
  }

  if (!res.ok) {
    const text = await res.text();
    console.error(`Spotify API error ${res.status}: ${text}`);
    throw createError({
      message: `Spotify API Fehler: ${res.statusText}`,
      statusCode: res.status === 401 ? 503 : res.status,
    });
  }

  // Some Spotify endpoints return empty or non-JSON bodies on success
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function searchTracks(query: string, limit = 10) {
  const params = new URLSearchParams({
    limit: String(limit),
    market: 'DE',
    q: query,
    type: 'track',
  });
  return spotifyFetch<SpotifySearchResponse>(`/search?${params}`);
}

export async function getCurrentlyPlaying() {
  return spotifyFetch<SpotifyCurrentlyPlaying | undefined>('/me/player/currently-playing');
}

export async function getQueue() {
  return spotifyFetch<SpotifyQueue>('/me/player/queue');
}

export async function addToQueue(uri: string) {
  const params = new URLSearchParams({ uri });
  return spotifyFetch(`/me/player/queue?${params}`, { method: 'POST' });
}

export async function getDevices() {
  return spotifyFetch<SpotifyDevicesResponse>('/me/player/devices');
}

// Spotify API response types
export type SpotifyTrack = {
  album: {
    images: Array<{ height: number; url: string; width: number }>;
    name: string;
  };
  artists: Array<{ name: string }>;
  duration_ms: number;
  explicit: boolean;
  id: string;
  name: string;
  uri: string;
};

export type SpotifySearchResponse = {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
};

export type SpotifyCurrentlyPlaying = {
  is_playing: boolean;
  item: SpotifyTrack;
  progress_ms: number;
} | undefined;

export type SpotifyQueue = {
  currently_playing: SpotifyTrack | null;
  queue: SpotifyTrack[];
};

export type SpotifyDevice = {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
  volume_percent: number;
};

export type SpotifyDevicesResponse = {
  devices: SpotifyDevice[];
};
