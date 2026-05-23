<script setup lang="ts">
import { Clapperboard, Filter, X } from 'lucide-vue-next';

const api = useApi();
const { loaded, load } = useDict();

const search = ref('');
const type = ref('');
const status = ref('');
const showFilters = ref(false);

const sortOptions = [
  { value: 'created_at', label: '最近添加' },
  { value: 'viewed_at', label: '观影日期' },
  { value: 'release_date', label: '上映日期' },
  { value: 'rating', label: '评分最高' },
];

const { items: mediaList, loading, initialLoading, hasMore, sort, setSort, sentinel, fetch, reset } =
  useInfiniteList({
    fetchFn: (page, limit, sort) =>
      api.get('/api/media', {
        page,
        limit,
        sort: sort || undefined,
        search: search.value || undefined,
        type: type.value || undefined,
        status: status.value || undefined,
      }),
    initialSort: 'created_at',
  });

function clearFilters() {
  search.value = '';
  type.value = '';
  status.value = '';
  reset();
}

watch([search, type, status], () => reset());

onMounted(async () => {
  if (!loaded.value) await load();
  fetch(true);
});
</script>

<template>
  <div>
    <div class="mb-4 flex items-center gap-3">
      <div class="flex-1"><SearchInput v-model="search" placeholder="搜索标题或导演..." /></div>
      <button
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors"
        :class="
          showFilters
            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400'
            : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
        "
        @click="showFilters = !showFilters"
      >
        <Filter class="h-4 w-4" />筛选
      </button>
    </div>
    <div
      v-if="showFilters"
      class="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <div class="w-full sm:w-40">
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">类型</label
        ><DictSelect v-model="type" category="media_type" placeholder="全部" clearable />
      </div>
      <div class="w-full sm:w-40">
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">状态</label
        ><DictSelect v-model="status" category="media_status" placeholder="全部" clearable />
      </div>
      <button
        class="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
        @click="clearFilters"
      >
        <X class="h-4 w-4" />清除
      </button>
    </div>

    <!-- Sort pills -->
    <div class="mb-4 flex flex-wrap gap-1.5">
      <button
        v-for="opt in sortOptions"
        :key="opt.value"
        class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
        :class="
          sort === opt.value
            ? 'bg-primary-600 text-white'
            : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
        "
        @click="setSort(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="initialLoading" class="flex justify-center py-16">
      <div
        class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>
    <EmptyState
      v-else-if="mediaList.length === 0"
      title="还没有媒体记录"
      description="开始记录你看过的电影和剧集吧"
      :icon="Clapperboard"
      action-label="添加媒体"
      @action="navigateTo('/media/add')"
    />
    <div v-else class="space-y-3">
      <MediaCard v-for="m in mediaList" :key="m.id" :media="m" />
    </div>

    <!-- Infinite scroll sentinel -->
    <div ref="sentinel" class="flex justify-center py-8">
      <div
        v-if="loading"
        class="border-primary-600 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
      />
      <span v-else-if="!hasMore && mediaList.length > 0" class="text-xs text-[var(--color-text-secondary)]">已加载全部</span>
    </div>

    <FabButton to="/media/add" />
  </div>
</template>
