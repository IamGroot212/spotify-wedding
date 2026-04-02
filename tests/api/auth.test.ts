import { describe, expect, it } from 'vitest';
import { apiFetch } from './helpers';

describe('auth API', () => {
  describe('gET /api/auth/spotify/status', () => {
    it('returns connection status', async () => {
      const { data, status } = await apiFetch<{ connected: boolean }>('/api/auth/spotify/status');
      expect(status).toBe(200);
      expect(typeof data.connected).toBe('boolean');
    });
  });

  describe('gET /api/auth/spotify/connect', () => {
    it('rejects without admin session', async () => {
      const { status } = await apiFetch('/api/auth/spotify/connect');
      expect(status).toBe(401);
    });
  });
});
