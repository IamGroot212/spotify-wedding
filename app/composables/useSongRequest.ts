import type { SearchResult } from './useSongSearch';

export function useSongRequest() {
  const isSubmitting = ref(false);
  const lastResult = ref<{ message: string; success: boolean } | null>(null);
  const toast = useToast();

  async function submitRequest(track: SearchResult, requestedBy?: string) {
    isSubmitting.value = true;
    lastResult.value = null;

    try {
      const data = await $fetch<{ message: string }>('/api/requests', {
        body: {
          album: track.album,
          artist: track.artist,
          coverUrl: track.coverUrl,
          requestedBy: requestedBy || undefined,
          spotifyTrackId: track.id,
          spotifyUri: track.uri,
          title: track.title,
        },
        method: 'POST',
      });

      lastResult.value = { message: data.message, success: true };
      toast.add({
        color: 'success',
        description: data.message,
        title: 'Eingereicht!',
      });
    }
    catch (err: unknown) {
      const message = err && typeof err === 'object' && 'data' in err
        ? (err.data as { message?: string })?.message || 'Ein Fehler ist aufgetreten.'
        : 'Ein Fehler ist aufgetreten.';

      lastResult.value = { message, success: false };
      toast.add({
        color: 'error',
        description: message,
        title: 'Fehler',
      });
    }
    finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    lastResult,
    submitRequest,
  };
}
