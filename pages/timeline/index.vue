<script setup lang="ts">
import { Clock } from 'lucide-vue-next';

const api = useApi();
const { loaded, load, getLabel } = useDict();
const { thumbnailUrl } = useImageProxy();

const moduleFilter = ref('all');

const moduleOptions = [
  { value: 'all', label: '全部', icon: '' },
  { value: 'foods', label: '美食', icon: '🍜' },
  { value: 'media', label: '影视', icon: '🎬' },
  { value: 'games', label: '游戏', icon: '🎮' },
  { value: 'books', label: '书籍', icon: '📚' },
];

const moduleIcon: Record<string, string> = {
  foods: '🍜',
  media: '🎬',
  games: '🎮',
  books: '📚',
};

const { items, loading, initialLoading, hasMore, sentinel, fetch, reset } = useInfiniteList({
  fetchFn: (page, limit) =>
    api.get('/api/timeline', {
      page,
      limit,
      modules: moduleFilter.value === 'all' ? undefined : moduleFilter.value,
    }),
  limit: 30,
});

watch(moduleFilter, () => reset());

onMounted(async () => {
  if (!loaded.value) await load();
  fetch(true);
});

/** Group items by date; returns array of { date: string, items: any[] } */
const groups = computed(() => {
  const map = new Map<string, any[]>();
  for (const item of items.value) {
    const key = String(item.date || '').slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return [...map.entries()].map(([date, items]) => ({ date, items }));
});

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekDay = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
  return `${month}月${day}日 周${weekDay}`;
}

function getSubtitle(item: any) {
  if (item.module === 'media') return getLabel('media_type', item.subtitle || '');
  return item.subtitle || '';
}

function getModuleLabel(item: any) {
  return moduleIcon[item.module] || '📌';
}
</script>

<template>
  <div>
    <h1 class="mb-4 text-xl font-bold text-[var(--color-text)]">时间轴</h1>

    <!-- Module filter pills -->
    <div class="mb-6 flex flex-wrap gap-1.5">
      <button
        v-for="opt in moduleOptions"
        :key="opt.value"
        class="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
        :class="
          moduleFilter === opt.value
            ? 'bg-primary-600 text-white'
            : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
        "
        @click="moduleFilter = opt.value"
      >
        <span v-if="opt.icon">{{ opt.icon }}</span>
        {{ opt.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="initialLoading" class="flex justify-center py-16">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        :class="'border-primary-600'"
        style="border-bottom-color: var(--color-primary-600, #2563eb); border-left-color: var(--color-primary-600, #2563eb); border-right-color: var(--color-primary-600, #2563eb)"
      />
    </div>

    <!-- Empty -->
    <div
      v-else-if="items.length === 0"
      class="py-16 text-center text-[var(--color-text-secondary)]"
    >
      <Clock class="mx-auto mb-3 h-10 w-10 opacity-30" />
      <p class="text-sm">暂无记录</p>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <!-- Vertical line -->
      <div class="absolute left-[19px] top-2 bottom-0 w-px bg-[var(--color-border)]" />

      <div v-for="group in groups" :key="group.date" class="relative mb-6">
        <!-- Date header -->
        <div class="mb-3 flex items-center gap-3">
          <div
            class="relative z-10 flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-border)] text-white"
            style="background-color: var(--color-primary-600, #2563eb)"
          >
            <span class="text-[10px] font-bold leading-tight">{{ group.date.slice(8) }}</span>
          </div>
          <div>
            <span class="text-sm font-semibold text-[var(--color-text)]">{{
              formatDate(group.date)
            }}</span>
          </div>
        </div>

        <!-- Items for this date -->
        <div class="ml-[50px] space-y-2">
          <NuxtLink
            v-for="item in group.items"
            :key="`${item.module}-${item.id}`"
            :to="`/${item.module}/${item.id}`"
            class="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <!-- Thumbnail -->
            <div
              class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg)]"
              :class="item.module === 'media' || item.module === 'books' ? 'w-9' : 'w-12'"
            >
              <img
                v-if="item.image"
                :src="thumbnailUrl(item.image)"
                :alt="item.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-lg"
              >
                {{ getModuleLabel(item) }}
              </div>
            </div>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs">{{ getModuleLabel(item) }}</span>
                <h3 class="line-clamp-1 text-sm font-medium text-[var(--color-text)]">
                  {{ item.title }}
                </h3>
              </div>
              <p class="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-secondary)]">
                {{ getSubtitle(item) }}
                <span v-if="item.rating"> · ⭐{{ item.rating }}</span>
              </p>
            </div>

            <!-- Chevron -->
            <span class="text-xs text-[var(--color-border)]">→</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="flex justify-center py-8">
        <div
          v-if="loading"
          class="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
          style="border-bottom-color: var(--color-primary-600, #2563eb); border-left-color: var(--color-primary-600, #2563eb); border-right-color: var(--color-primary-600, #2563eb)"
        />
        <span
          v-else-if="!hasMore && items.length > 0"
          class="text-xs text-[var(--color-text-secondary)]"
          >已加载全部</span
        >
      </div>
    </div>
  </div>
</template>
