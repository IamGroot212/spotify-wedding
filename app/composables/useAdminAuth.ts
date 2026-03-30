export function useAdminAuth() {
  const isAuthenticated = useState('admin-auth', () => false);
  const isChecking = ref(true);

  async function checkSession() {
    isChecking.value = true;
    try {
      const data = await $fetch<{ authenticated: boolean }>('/api/admin/session');
      isAuthenticated.value = data.authenticated;
    }
    catch {
      isAuthenticated.value = false;
    }
    finally {
      isChecking.value = false;
    }
  }

  async function login(password: string): Promise<boolean> {
    try {
      await $fetch('/api/admin/login', {
        body: { password },
        method: 'POST',
      });
      isAuthenticated.value = true;
      return true;
    }
    catch {
      return false;
    }
  }

  return {
    checkSession,
    isAuthenticated,
    isChecking,
    login,
  };
}
