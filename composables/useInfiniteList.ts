/**
 * 无限滚动列表 composable
 * 封装 IntersectionObserver 滚动加载逻辑，供所有列表页复用
 */

import type { ApiResponse } from './useApi';

interface InfiniteListOptions {
  /** 获取数据的函数，接收 page、limit、sort，返回 API 响应 */
  fetchFn: (page: number, limit: number, sort: string) => Promise<ApiResponse<any[]> | null>;
  /** 每页条数，默认 20 */
  limit?: number;
  /** 初始排序方式 */
  initialSort?: string;
}

export function useInfiniteList(options: InfiniteListOptions) {
  const { fetchFn, limit = 20, initialSort = '' } = options;

  const items = ref<any[]>([]);
  const loading = ref(false);
  const initialLoading = ref(true);
  const hasMore = ref(true);
  const page = ref(1);
  const sort = ref(initialSort);
  const total = ref(0);

  async function fetch(reset = false) {
    if (loading.value) return;
    if (!hasMore.value && !reset) return;

    loading.value = true;
    if (reset) {
      page.value = 1;
      items.value = [];
      hasMore.value = true;
    }

    const res = await fetchFn(page.value, limit, sort.value);
    if (res) {
      if (reset || page.value === 1) {
        items.value = res.data ?? [];
      } else {
        items.value.push(...(res.data ?? []));
      }
      total.value = res.meta?.total ?? 0;
      hasMore.value = items.value.length < total.value;
      page.value++;
    } else {
      hasMore.value = false;
    }

    loading.value = false;
    if (reset || page.value === 1) {
      initialLoading.value = false;
    }
  }

  function reset() {
    fetch(true);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }

  function setSort(newSort: string) {
    if (sort.value === newSort) return;
    sort.value = newSort;
    reset();
  }

  // IntersectionObserver for scroll loading
  const sentinel = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore.value && !loading.value) {
          fetch();
        }
      },
      { rootMargin: '200px' },
    );
    if (sentinel.value) observer.observe(sentinel.value);
  });

  watch(sentinel, (el) => {
    if (el && observer) observer.observe(el);
    return () => {
      if (el && observer) observer.unobserve(el);
    };
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return { items, loading, initialLoading, hasMore, total, sort, setSort, sentinel, fetch, reset };
}
