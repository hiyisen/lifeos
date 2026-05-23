<script setup lang="ts">
import { UtensilsCrossed, Filter, X } from 'lucide-vue-next';

const api = useApi();
const { loaded, load } = useDict();

// Filters
const search = ref('');
const cuisine = ref('');
const ratingMin = ref<number | undefined>();
const dateFrom = ref('');
const dateTo = ref('');
const showFilters = ref(false);

const sortOptions = [
  { value: 'visited_at', label: '就餐日期' },
  { value: 'rating', label: '评分最高' },
  { value: 'created_at', label: '最近添加' },
];

const { items: foods, loading, initialLoading, hasMore, sort, setSort, sentinel, fetch, reset } =
  useInfiniteList({
    fetchFn: (page, limit, sort) =>
      api.get('/api/foods', {
        page,
        limit,
        sort: sort || undefined,
        search: search.value || undefined,
        cuisine: cuisine.value || undefined,
        rating_min: ratingMin.value,
        date_from: dateFrom.value || undefined,
        date_to: dateTo.value || undefined,
      }),
    initialSort: 'visited_at',
  });

function clearFilters() {
  search.value = '';
  cuisine.value = '';
  ratingMin.value = undefined;
  dateFrom.value = '';
  dateTo.value = '';
  reset();
}

watch([search, cuisine, ratingMin, dateFrom, dateTo], () => reset());

onMounted(async () => {
  if (!loaded.value) await load();
  fetch(true);
});
</script>

<template>
  <div>
    <!-- Search & filter bar -->
    <div class="mb-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <SearchInput v-model="search" placeholder="搜索菜品或餐厅..." />
        </div>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors"
          :class="
            showFilters
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
          "
          @click="showFilters = !showFilters"
        >
          <Filter class="h-4 w-4" />
          筛选
          <span
            v-if="cuisine || ratingMin"
            class="bg-primary-600 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white"
          >
            {{ (cuisine ? 1 : 0) + (ratingMin ? 1 : 0) }}
          </span>
        </button>
      </div>

      <!-- Filter panel -->
      <div
        v-if="showFilters"
        class="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      >
        <div class="w-full sm:w-40">
          <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]"
            >菜系</label
          >
          <DictSelect v-model="cuisine" category="cuisine_tag" placeholder="全部菜系" clearable />
        </div>
        <div class="w-full sm:w-40">
          <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]"
            >最低评分</label
          >
          <select
            v-model="ratingMin"
            class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none"
          >
            <option :value="undefined">不限</option>
            <option v-for="r in [9, 8, 7, 6, 5, 4]" :key="r" :value="r">{{ r }}+ 分</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]"
            >开始日期</label
          >
          <input
            v-model="dateFrom"
            type="date"
            class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]"
            >结束日期</label
          >
          <input
            v-model="dateTo"
            type="date"
            class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none"
          />
        </div>
        <button
          class="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg)]"
          @click="clearFilters"
        >
          <X class="h-4 w-4" />
          清除
        </button>
      </div>
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

    <!-- Results -->
    <div v-if="initialLoading" class="flex justify-center py-16">
      <div
        class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>

    <EmptyState
      v-else-if="foods.length === 0"
      title="还没有美食记录"
      description="开始记录你吃过的美食吧"
      :icon="UtensilsCrossed"
      action-label="添加第一条记录"
      @action="navigateTo('/foods/add')"
    />

    <template v-else>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FoodCard v-for="food in foods" :key="food.id" :food="food" />
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="flex justify-center py-8">
        <div
          v-if="loading"
          class="border-primary-600 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
        />
        <span v-else-if="!hasMore && foods.length > 0" class="text-xs text-[var(--color-text-secondary)]">已加载全部</span>
      </div>
    </template>

    <FabButton to="/foods/add" />
  </div>
</template>
