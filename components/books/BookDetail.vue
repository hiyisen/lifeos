<script setup lang="ts">
import { Pencil, Trash2, BookOpen } from 'lucide-vue-next';

defineProps<{ book: Record<string, any> }>();
defineEmits<{ edit: [id: number]; delete: [id: number] }>();
const { getLabel, loaded, load } = useDict();
if (!loaded.value) load();
const showDeleteConfirm = ref(false);
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:gap-6">
      <div
        class="h-40 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] sm:h-48 sm:w-36"
      >
        <img
          v-if="book.cover_path"
          :src="book.cover_path"
          :alt="book.title"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <BookOpen class="h-12 w-12 text-[var(--color-text-secondary)]" />
        </div>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text)]">{{ book.title }}</h1>
        <p v-if="book.original_title" class="text-sm text-[var(--color-text-secondary)]">
          {{ book.original_title }}
        </p>
        <p class="mt-1 text-[var(--color-text-secondary)]">{{ book.author || '' }}</p>
        <div
          class="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[var(--color-text-secondary)]"
        >
          <span v-if="book.publisher">{{ book.publisher }}</span>
          <span v-if="book.publish_year">{{ book.publish_year }}</span>
          <span v-if="book.isbn">ISBN {{ book.isbn }}</span>
          <span v-if="book.price">{{ book.price }}</span>
          <span v-if="book.series">丛书：{{ book.series }}</span>
        </div>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <StatusBadge :label="getLabel('book_type', book.type)" />
          <StatusBadge :label="getLabel('book_status', book.status)" />
        </div>
        <div v-if="book.rating" class="mt-3">
          <RatingStars :model-value="book.rating" readonly />
        </div>
        <p v-if="book.page_count" class="mt-1 text-sm text-[var(--color-text-secondary)]">
          进度: {{ book.current_page || 0 }} / {{ book.page_count }} 页
        </p>
      </div>
    </div>
    <div
      v-if="book.summary"
      class="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <h3 class="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">简介</h3>
      <p class="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-secondary)]">
        {{ book.summary }}
      </p>
    </div>
    <div
      v-if="book.review"
      class="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <h3 class="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">短评</h3>
      <p class="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-secondary)]">
        {{ book.review }}
      </p>
    </div>
    <div class="flex gap-3 border-t border-[var(--color-border)] pt-6">
      <button
        class="bg-primary-600 hover:bg-primary-700 inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white"
        @click="$emit('edit', book.id)"
      >
        <Pencil class="h-4 w-4" />编辑
      </button>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
        @click="showDeleteConfirm = true"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>
    <ConfirmDialog
      :open="showDeleteConfirm"
      title="删除书籍"
      :message="`确定要删除「${book.title}」吗？`"
      confirm-text="删除"
      variant="danger"
      @confirm="
        $emit('delete', book.id);
        showDeleteConfirm = false;
      "
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
