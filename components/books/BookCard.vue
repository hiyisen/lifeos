<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next';

defineProps<{ book: Record<string, any> }>();
const { getLabel, loaded, load } = useDict();
const { proxyUrl } = useImageProxy();
if (!loaded.value) load();
</script>

<template>
  <NuxtLink
    :to="`/books/${book.id}`"
    class="group flex gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div
      class="h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg)] sm:h-28 sm:w-20"
    >
      <img
        v-if="book.cover_path"
        :src="proxyUrl(book.cover_path)"
        :alt="book.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <BookOpen class="h-6 w-6 text-[var(--color-text-secondary)]" />
      </div>
    </div>
    <div class="flex min-w-0 flex-1 flex-col justify-between">
      <div>
        <h3 class="line-clamp-1 font-semibold text-[var(--color-text)]">{{ book.title }}</h3>
        <p
          v-if="book.original_title && book.original_title !== book.title"
          class="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-secondary)]"
        >
          {{ book.original_title }}
        </p>
        <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          <span v-if="book.author">{{ book.author }}</span>
          <span v-if="book.page_count"> · {{ book.page_count }}页</span>
          <span v-if="book.publisher"> · {{ book.publisher }}</span>
        </p>
        <p
          v-if="book.series"
          class="mt-0.5 line-clamp-1 text-[10px] text-[var(--color-text-secondary)]"
        >
          丛书：{{ book.series }}
        </p>
      </div>
      <div class="mt-1.5 flex items-center gap-1.5">
        <StatusBadge :label="getLabel('book_type', book.type)" size="sm" />
        <StatusBadge :label="getLabel('book_status', book.status)" size="sm" />
        <RatingStars v-if="book.rating" :model-value="book.rating" readonly size="sm" />
      </div>
    </div>
  </NuxtLink>
</template>
