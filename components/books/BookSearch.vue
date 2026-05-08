<script setup lang="ts">
const { query, results, loading } = useSearch('books');

const emit = defineEmits<{
  select: [item: any];
}>();

function getRating(item: any) {
  if (!item.rating) return null;
  return item.rating;
}
</script>

<template>
  <div>
    <SearchInput v-model="query" placeholder="搜索书籍..." />

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
            title: item.title,
            author: Array.isArray(item.author) ? item.author.join('、') : item.author || undefined,
            isbn: item.isbn || undefined,
            rating: item.rating || undefined,
            cover_path: item.cover || undefined,
            source_id: item.source_id,
            source_url: item.source_url,
            review: '',
          })
        "
      >
        <img
          v-if="item.cover"
          :src="item.cover"
          class="h-16 w-12 flex-shrink-0 rounded object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded bg-[var(--color-bg)] text-xl"
        >
          📖
        </div>
        <div class="min-w-0 flex-1">
          <p class="line-clamp-1 font-medium text-[var(--color-text)]">{{ item.title }}</p>
          <p
            v-if="Array.isArray(item.author) && item.author.length > 0"
            class="text-xs text-[var(--color-text-secondary)]"
          >
            {{ item.author.join('、') }}
          </p>
          <div class="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span v-if="item.publisher" class="text-xs text-[var(--color-text-secondary)]">{{
              item.publisher
            }}</span>
            <span v-if="item.year" class="text-xs text-[var(--color-text-secondary)]"
              >· {{ item.year }}</span
            >
            <span
              v-if="getRating(item)"
              class="text-xs font-medium text-yellow-600 dark:text-yellow-400"
              >⭐ {{ getRating(item) }}</span
            >
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
