export function useSearch(source: 'media' | 'books' | 'games') {
  const api = useApi();
  const query = ref('');
  const results = ref<any[]>([]);
  const loading = ref(false);
  const fetched = ref(false);

  async function search() {
    const q = query.value.trim();
    if (!q || q.length < 2) {
      results.value = [];
      fetched.value = false;
      return;
    }
    loading.value = true;
    fetched.value = true;
    try {
      const res = await api.get<any[]>('/api/search/' + source, { q });
      if (res.success) results.value = res.data;
      else results.value = [];
    } catch (e) {
      console.warn('Search failed:', e);
      results.value = [];
    } finally {
      loading.value = false;
    }
  }

  function clear() {
    query.value = '';
    results.value = [];
    fetched.value = false;
  }

  return { query, results, loading, fetched, search, clear };
}
