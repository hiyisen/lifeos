<script setup lang="ts">
const props = withDefaults(
  defineProps<{ initialData?: Record<string, any>; loading?: boolean; isEdit?: boolean }>(),
  { loading: false, isEdit: false },
);
const emit = defineEmits<{ submit: [data: Record<string, any>]; cancel: [] }>();

const form = reactive({
  title: props.initialData?.title || '',
  author: props.initialData?.author || '',
  isbn: props.initialData?.isbn || '',
  type: props.initialData?.type || 'paper',
  rating: props.initialData?.rating || 0,
  review: props.initialData?.review || '',
  status: props.initialData?.status || 'wishlist',
  page_count: props.initialData?.page_count || (undefined as number | undefined),
  current_page: props.initialData?.current_page || 0,
});

const errors = reactive<{ title?: string }>({});

function validate(): boolean {
  errors.title = undefined;
  if (!form.title.trim()) errors.title = '请输入书名';
  return !errors.title;
}

function onSubmit() {
  if (!validate()) return;
  emit('submit', {
    title: form.title.trim(),
    author: form.author.trim() || undefined,
    isbn: form.isbn.trim() || undefined,
    type: form.type,
    rating: form.rating || undefined,
    review: form.review.trim() || undefined,
    status: form.status,
    page_count: form.page_count || undefined,
    current_page: form.current_page,
  });
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
        >书名 <span class="text-red-500">*</span></label
      ><input
        v-model="form.title"
        type="text"
        class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        :class="
          errors.title
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'focus:border-primary-500 focus:ring-primary-500 border-[var(--color-border)]'
        "
        style="background-color: var(--color-surface); color: var(--color-text)"
      />
      <p v-if="errors.title" class="mt-1 text-xs text-red-500">{{ errors.title }}</p>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">作者</label
        ><input
          v-model="form.author"
          type="text"
          class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">ISBN</label
        ><input
          v-model="form.isbn"
          type="text"
          class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">类型</label
        ><DictSelect v-model="form.type" category="book_type" placeholder="选择类型" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">评分</label
        ><RatingStars v-model="form.rating" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">状态</label
        ><DictSelect v-model="form.status" category="book_status" placeholder="选择状态" />
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">总页数</label
        ><input
          v-model.number="form.page_count"
          type="number"
          min="1"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">当前页</label
        ><input
          v-model.number="form.current_page"
          type="number"
          min="0"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
    </div>
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">短评</label
      ><textarea
        v-model="form.review"
        rows="3"
        class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
        style="background-color: var(--color-surface); color: var(--color-text)"
      />
    </div>
    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        class="rounded-lg border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        @click="$emit('cancel')"
      >
        取消
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="bg-primary-600 hover:bg-primary-700 rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {{ loading ? '保存中...' : '保存' }}
      </button>
    </div>
  </form>
</template>
