import { describe, expect, it } from 'vitest';
import { apiFetch } from './helpers';

describe('spotify API', () => {
  describe('gET /api/spotify/search', () => {
    it('rejects missing query', async () => {
      const { status } = await apiFetch('/api/spotify/search');
      expect(status).toBeGreaterThanOrEqual(400);
    });

    it('rejects empty query', async () => {
      const { status } = await apiFetch('/api/spotify/search?q=');
      expect(status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('gET /api/spotify/now-playing', () => {
    it('returns response or 503 when not connected', async () => {
      const { status } = await apiFetch('/api/spotify/now-playing');
      // 200 if connected, 503 if not
      expect([200, 503]).toContain(status);
    });
  });

  describe('gET /api/spotify/queue', () => {
    it('returns response or 503 when not connected', async () => {
      const { status } = await apiFetch('/api/spotify/queue');
      expect([200, 503]).toContain(status);
    });
  });

  describe('gET /api/spotify/devices', () => {
    it('returns response or 503 when not connected', async () => {
      const { status } = await apiFetch('/api/spotify/devices');
      expect([200, 503]).toContain(status);
    });
  });
});
