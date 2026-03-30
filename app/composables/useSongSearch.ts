import { useDebounceFn } from '@vueuse/core';

export type SearchResult = {
  album: string;
  artist: string;
  coverUrl: string | null;
  durationMs: number;
  explicit: boolean;
  id: string;
  title: string;
  uri: string;
};

export function useSongSearch() {
  const query = ref('');
  const results = ref<SearchResult[]>([]);
  const isSearching = ref(false);
  const error = ref<string | null>(null);

  const performSearch = useDebounceFn(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      results.value = [];
      return;
    }

    isSearching.value = true;
    error.value = null;

    try {
      const data = await $fetch<SearchResult[]>('/api/spotify/search', {
        params: { q: searchQuery },
      });
      results.value = data;
    }
    catch (err: unknown) {
      if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 503) {
        error.value = 'Spotify ist nicht verbunden.';
      }
      else {
        error.value = 'Suche fehlgeschlagen. Bitte erneut versuchen.';
      }
      results.value = [];
    }
    finally {
      isSearching.value = false;
    }
  }, 400);

  watch(query, (val) => {
    if (!val || val.length < 2) {
      results.value = [];
      return;
    }
    performSearch(val);
  });

  function clear() {
    query.value = '';
    results.value = [];
    error.value = null;
  }

  return {
    clear,
    error,
    isSearching,
    query,
    results,
  };
}
