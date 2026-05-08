<script setup lang="ts">
const { query, results, loading } = useSearch('media');

const emit = defineEmits<{
  select: [item: any];
}>();

function getTitle(item: any) {
  return item.title || '未知';
}
function getYear(item: any) {
  return item.year || '';
}
function getTypeLabel(item: any) {
  const labels: Record<string, string> = {
    movie: '电影',
    tv: '电视剧',
    anime: '动画',
    documentary: '纪录片',
    variety: '综艺',
  };
  return labels[item.type] || item.type || '';
}
</script>

<template>
  <div>
    <SearchInput v-model="query" placeholder="搜索电影/电视剧/动画..." />

    <div v-if="loading" class="mt-3 text-center text-sm text-[var(--color-text-secondary)]">
      搜索中...
    </div>

    <div v-if="results.length > 0" class="mt-3 space-y-2">
      <button
        v-for="item in results"
        :key="item.source_id"
        type="button"
        class="hover:border-primary-400 flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] p-2 text-left transition-colors hover:bg-[var(--color-bg)]"
        @click="
          emit('select', {
            title: getTitle(item),
            type: item.type,
            year: item.year || undefined,
            rating: item.rating || undefined,
            director: item.director || undefined,
            poster_path: item.poster || undefined,
            source_id: item.source_id,
            source_url: item.source_url,
            review: '',
          })
        "
      >
        <img
          v-if="item.poster"
          :src="item.poster"
          class="h-16 w-12 flex-shrink-0 rounded object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded bg-[var(--color-bg)] text-xl"
        >
          {{ item.type === 'tv' ? '📺' : '🎬' }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="line-clamp-1 font-medium text-[var(--color-text)]">
            {{ getTitle(item) }}
            <span
              v-if="item.original_title && item.original_title !== item.title"
              class="text-xs text-[var(--color-text-secondary)]"
              >({{ item.original_title }})</span
            >
          </p>
          <div class="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span class="text-xs text-[var(--color-text-secondary)]">{{ getTypeLabel(item) }}</span>
            <span v-if="getYear(item)" class="text-xs text-[var(--color-text-secondary)]"
              >· {{ getYear(item) }}</span
            >
            <span
              v-if="item.rating"
              class="text-xs font-medium text-yellow-600 dark:text-yellow-400"
              >⭐ {{ item.rating }}</span
            >
          </div>
          <p
            v-if="item.director"
            class="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]"
          >
            {{ item.director }}
          </p>
          <p
            v-if="item.summary"
            class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]"
          >
            {{ item.summary }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>
