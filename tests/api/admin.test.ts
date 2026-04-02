import { describe, expect, it } from 'vitest';
import { apiFetch, loginAsAdmin } from './helpers';

describe('admin API', () => {
  describe('gET /api/admin/session', () => {
    it('returns unauthenticated by default', async () => {
      const { data, status } = await apiFetch<{ authenticated: boolean }>('/api/admin/session');
      expect(status).toBe(200);
      expect(data.authenticated).toBe(false);
    });
  });

  describe('pOST /api/admin/login', () => {
    it('rejects wrong password', async () => {
      const { status } = await apiFetch('/api/admin/login', {
        body: JSON.stringify({ password: 'wrong-password' }),
        method: 'POST',
      });
      expect(status).toBe(401);
    });

    it('accepts correct password', async () => {
      const { data, status } = await apiFetch<{ ok: boolean }>('/api/admin/login', {
        body: JSON.stringify({ password: 'BCJHQCS87t5TXb2eSNVSzw' }),
        method: 'POST',
      });
      expect(status).toBe(200);
      expect(data.ok).toBe(true);
    });
  });

  describe('admin-protected endpoints (without auth)', () => {
    it('gET /api/admin/settings returns 401', async () => {
      const { status } = await apiFetch('/api/admin/settings');
      expect(status).toBe(401);
    });

    it('pATCH /api/admin/settings returns 401', async () => {
      const { status } = await apiFetch('/api/admin/settings', {
        body: JSON.stringify({ cooldownSeconds: 60 }),
        method: 'PATCH',
      });
      expect(status).toBe(401);
    });

    it('pOST /api/admin/queue returns 401', async () => {
      const { status } = await apiFetch('/api/admin/queue', {
        body: JSON.stringify({ requestId: 1 }),
        method: 'POST',
      });
      expect(status).toBe(401);
    });
  });

  describe('admin-protected endpoints (with auth)', () => {
    it('gET /api/admin/settings returns settings', async () => {
      const cookie = await loginAsAdmin();
      const { data, status } = await apiFetch<{ settings: Record<string, unknown> }>('/api/admin/settings', {
        headers: { Cookie: cookie },
      });
      expect(status).toBe(200);
      expect(data.settings).toHaveProperty('cooldownSeconds');
      expect(data.settings).toHaveProperty('duplicateWindowMinutes');
      expect(data.settings).toHaveProperty('requireApproval');
    });
  });
});
