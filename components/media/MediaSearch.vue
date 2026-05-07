<script setup lang="ts">
const { query, results, loading } = useSearch('media');

const emit = defineEmits<{
  select: [item: any];
}>();

function getTitle(item: any) {
  return item.title || item.name || '未知';
}
function getYear(item: any) {
  const date = item.release_date || item.first_air_date;
  return date ? new Date(date).getFullYear() : '';
}
function getType(item: any) {
  return item.media_type === 'movie' ? 'movie' : 'tv';
}
function getPoster(item: any) {
  if (!item.poster_path) return undefined;
  return `https://image.tmdb.org/t/p/w185${item.poster_path}`;
}
</script>

<template>
  <div>
    <SearchInput v-model="query" placeholder="搜索电影/电视剧..." />

    <div v-if="loading" class="mt-3 text-center text-sm text-[var(--color-text-secondary)]">
      搜索中...
    </div>

    <div v-if="results.length > 0" class="mt-3 space-y-2">
      <button
        v-for="item in results"
        :key="item.id"
        type="button"
        class="hover:border-primary-400 flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] p-2 text-left transition-colors hover:bg-[var(--color-bg)]"
        @click="
          emit('select', {
            title: getTitle(item),
            type: getType(item),
            year: getYear(item) || undefined,
            source_id: `tmdb:${item.id}`,
            source_url: `https://www.themoviedb.org/${item.media_type}/${item.id}`,
          })
        "
      >
        <img
          v-if="getPoster(item)"
          :src="getPoster(item)"
          class="h-16 w-12 flex-shrink-0 rounded object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded bg-[var(--color-bg)] text-xl"
        >
          {{ getType(item) === 'movie' ? '🎬' : '📺' }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="line-clamp-1 font-medium text-[var(--color-text)]">{{ getTitle(item) }}</p>
          <p class="text-xs text-[var(--color-text-secondary)]">
            {{ getType(item) === 'movie' ? '电影' : '电视剧' }}
            <span v-if="getYear(item)">· {{ getYear(item) }}</span>
          </p>
        </div>
      </button>
    </div>
  </div>
</template>
