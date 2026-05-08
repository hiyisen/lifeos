<script setup lang="ts">
const props = withDefaults(
  defineProps<{ initialData?: Record<string, any>; loading?: boolean; isEdit?: boolean }>(),
  { loading: false, isEdit: false },
);
const emit = defineEmits<{ submit: [data: Record<string, any>]; cancel: [] }>();

const form = reactive({
  title: props.initialData?.title || '',
  original_title: props.initialData?.original_title || '',
  author: props.initialData?.author || '',
  isbn: props.initialData?.isbn || '',
  publisher: props.initialData?.publisher || '',
  publish_year: props.initialData?.publish_year || (undefined as number | undefined),
  price: props.initialData?.price || '',
  series: props.initialData?.series || '',
  type: props.initialData?.type || 'paper',
  rating: props.initialData?.rating || 0,
  summary: props.initialData?.summary || '',
  review: props.initialData?.review || '',
  status: props.initialData?.status || 'wishlist',
  page_count: props.initialData?.page_count || (undefined as number | undefined),
  current_page: props.initialData?.current_page || 0,
  cover_path: props.initialData?.cover_path || '',
  source_id: props.initialData?.source_id || '',
  source_url: props.initialData?.source_url || '',
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
    original_title: form.original_title?.trim() || undefined,
    author: form.author?.trim() || undefined,
    isbn: form.isbn?.trim() || undefined,
    publisher: form.publisher?.trim() || undefined,
    publish_year: form.publish_year || undefined,
    price: form.price?.trim() || undefined,
    series: form.series?.trim() || undefined,
    type: form.type,
    rating: form.rating || undefined,
    summary: form.summary?.trim() || undefined,
    review: form.review?.trim() || undefined,
    status: form.status,
    page_count: form.page_count || undefined,
    current_page: form.current_page,
    cover_path: form.cover_path || undefined,
    source_id: form.source_id || undefined,
    source_url: form.source_url || undefined,
  });
}

const showSearch = ref(!props.isEdit);
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <!-- External search (add mode only) -->
    <div v-if="!isEdit && showSearch">
      <BookSearch
        @select="
          (item) => {
            Object.assign(form, item);
            showSearch = false;
          }
        "
      />
      <p class="mt-2 text-xs text-[var(--color-text-secondary)]">
        或
        <button type="button" class="text-primary-600 hover:underline" @click="showSearch = false">
          手动输入
        </button>
      </p>
    </div>

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
      <p v-if="form.original_title" class="mt-1 text-xs text-[var(--color-text-secondary)]">
        原名：{{ form.original_title }}
      </p>
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
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">出版社</label
        ><input
          v-model="form.publisher"
          type="text"
          class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">出版年</label
        ><input
          v-model.number="form.publish_year"
          type="number"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">定价</label
        ><input
          v-model="form.price"
          type="text"
          placeholder="23.00"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">丛书</label
        ><input
          v-model="form.series"
          type="text"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
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
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">简介</label
      ><textarea
        v-model="form.summary"
        rows="3"
        placeholder="内容简介..."
        class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
        style="background-color: var(--color-surface); color: var(--color-text)"
      />
    </div>
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">短评</label
      ><textarea
        v-model="form.review"
        rows="3"
        placeholder="写点感想..."
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
