export interface DictItem {
  id: number;
  category_id: number;
  code: string;
  label: string;
  color: string | null;
  icon: string | null;
  sort_order: number;
  is_builtin: number;
}

export interface DictCategory {
  id: number;
  code: string;
  name: string;
  items: DictItem[];
}

const categories = ref<DictCategory[]>([]);
const loaded = ref(false);
const loading = ref(false);

export function useDict() {
  async function load() {
    if (loaded.value || loading.value) return;
    loading.value = true;
    try {
      const api = useApi();
      const res = await api.get<DictCategory[]>('/api/dict');
      if (res.success) {
        categories.value = res.data;
        loaded.value = true;
      }
    } catch {
      // retry on next call
    } finally {
      loading.value = false;
    }
  }

  // Auto-load on first access
  if (!loaded.value && !loading.value && import.meta.client) {
    load();
  }

  function getItems(category: string): DictItem[] {
    const cat = categories.value.find((c) => c.code === category);
    return cat?.items ?? [];
  }

  function getLabel(category: string, code: string): string {
    for (const cat of categories.value) {
      if (cat.code === category) {
        const item = cat.items.find((i) => i.code === code);
        return item?.label ?? code;
      }
    }
    return code;
  }

  function getColor(category: string, code: string): string | null {
    for (const cat of categories.value) {
      if (cat.code === category) {
        const item = cat.items.find((i) => i.code === code);
        return item?.color ?? null;
      }
    }
    return null;
  }

  return { categories, loaded, loading, load, getItems, getLabel, getColor };
}
