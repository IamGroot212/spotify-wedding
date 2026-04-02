import { describe, expect, it } from 'vitest';
import { apiFetch, loginAsAdmin } from './helpers';

describe('requests API', () => {
  describe('gET /api/requests', () => {
    it('returns request list', async () => {
      const { data, status } = await apiFetch<{ requests: unknown[] }>('/api/requests');
      expect(status).toBe(200);
      expect(Array.isArray(data.requests)).toBe(true);
    });

    it('filters by status', async () => {
      const { data, status } = await apiFetch<{ requests: unknown[] }>('/api/requests?status=pending');
      expect(status).toBe(200);
      expect(Array.isArray(data.requests)).toBe(true);
    });
  });

  describe('pOST /api/requests', () => {
    it('rejects invalid body', async () => {
      const { status } = await apiFetch('/api/requests', {
        body: JSON.stringify({}),
        method: 'POST',
      });
      expect(status).toBeGreaterThanOrEqual(400);
    });

    it('accepts valid song request', async () => {
      const trackId = `test-${Date.now()}`;
      const { data, status } = await apiFetch<{ message: string; request: { id: number; status: string } }>('/api/requests', {
        body: JSON.stringify({
          artist: 'Test Artist',
          coverUrl: null,
          spotifyTrackId: trackId,
          spotifyUri: `spotify:track:${trackId}`,
          title: 'Test Song',
        }),
        method: 'POST',
      });
      expect(status).toBe(200);
      expect(data.message).toBeDefined();
      expect(data.request.id).toBeGreaterThan(0);
      expect(data.request.status).toBe('pending');
    });

    it('rejects duplicate within window', async () => {
      const trackId = `dup-${Date.now()}`;
      const body = JSON.stringify({
        artist: 'Dup Artist',
        spotifyTrackId: trackId,
        spotifyUri: `spotify:track:${trackId}`,
        title: 'Dup Song',
      });

      // First should succeed
      const first = await apiFetch('/api/requests', { body, method: 'POST' });
      expect(first.status).toBe(200);

      // Second should fail
      const second = await apiFetch('/api/requests', { body, method: 'POST' });
      expect(second.status).toBe(409);
    });
  });

  describe('pATCH /api/requests/:id', () => {
    it('rejects without admin auth', async () => {
      const { status } = await apiFetch('/api/requests/1', {
        body: JSON.stringify({ status: 'approved' }),
        method: 'PATCH',
      });
      expect(status).toBe(401);
    });

    it('rejects non-existent request', async () => {
      const cookie = await loginAsAdmin();
      const { status } = await apiFetch('/api/requests/99999', {
        body: JSON.stringify({ status: 'approved' }),
        headers: { Cookie: cookie },
        method: 'PATCH',
      });
      // 400 (validation) or 404 (not found) are both acceptable
      expect([400, 404]).toContain(status);
    });
  });
});
