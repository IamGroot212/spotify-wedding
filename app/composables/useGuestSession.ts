export function useGuestSession() {
  const sessionId = useState<string>('guest-session', () => '');

  onMounted(() => {
    let id = localStorage.getItem('guest_session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('guest_session_id', id);
    }
    sessionId.value = id;
  });

  return { sessionId };
}
