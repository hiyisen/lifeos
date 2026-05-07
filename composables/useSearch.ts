export function useSearch(source: 'media' | 'books' | 'games') {
  const query = ref('');
  const results = ref<any[]>([]);
  const loading = ref(false);
  const debouncedQuery = refDebounced(query, 400);

  watch(debouncedQuery, async (q) => {
    if (!q || q.length < 2) {
      results.value = [];
      return;
    }
    loading.value = true;
    try {
      const api = useApi();
      const res = await api.get<any[]>(`/api/search/${source}`, { q });
      if (res.success) results.value = res.data;
    } finally {
      loading.value = false;
    }
  });

  return { query, results, loading };
}
