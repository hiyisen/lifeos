<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    initialData?: Record<string, any>;
    loading?: boolean;
    isEdit?: boolean;
  }>(),
  { loading: false, isEdit: false },
);

const emit = defineEmits<{ submit: [data: Record<string, any>]; cancel: [] }>();

const form = reactive({
  title: props.initialData?.title || '',
  type: props.initialData?.type || 'movie',
  year: props.initialData?.year || (undefined as number | undefined),
  director: props.initialData?.director || '',
  rating: props.initialData?.rating || 0,
  review: props.initialData?.review || '',
  status: props.initialData?.status || 'wishlist',
  current_season: props.initialData?.current_season || 1,
  current_episode: props.initialData?.current_episode || 0,
  total_episodes: props.initialData?.total_episodes || (undefined as number | undefined),
  poster_path: props.initialData?.poster_path || '',
  source_id: props.initialData?.source_id || '',
  source_url: props.initialData?.source_url || '',
});

const errors = reactive<{ title?: string }>({});

function validate() {
  errors.title = undefined;
  if (!form.title.trim()) errors.title = '请输入标题';
  return !errors.title;
}

function onSubmit() {
  if (!validate()) return;
  emit('submit', {
    title: form.title.trim(),
    type: form.type,
    year: form.year || undefined,
    director: form.director.trim() || undefined,
    rating: form.rating || undefined,
    review: form.review.trim() || undefined,
    status: form.status,
    current_season: form.current_season,
    current_episode: form.current_episode,
    total_episodes: form.total_episodes || undefined,
    poster_path: form.poster_path || undefined,
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
      <MediaSearch
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

    <!-- Title -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        标题 <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.title"
        type="text"
        class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        :class="
          errors.title
            ? 'border-red-500'
            : 'focus:border-primary-500 focus:ring-primary-500 border-[var(--color-border)]'
        "
        style="background-color: var(--color-surface); color: var(--color-text)"
      />
    </div>

    <!-- Type + Year + Director -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">类型</label>
        <DictSelect v-model="form.type" category="media_type" placeholder="选择类型" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">年份</label>
        <input
          v-model.number="form.year"
          type="number"
          class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">导演</label>
        <input
          v-model="form.director"
          type="text"
          class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
    </div>

    <!-- Rating + Status -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">评分</label>
        <RatingStars v-model="form.rating" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">状态</label>
        <DictSelect v-model="form.status" category="media_status" placeholder="选择状态" />
      </div>
    </div>

    <!-- Episodes (for TV) -->
    <div
      v-if="form.type === 'tv' || form.type === 'anime'"
      class="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">当前季</label>
        <input
          v-model.number="form.current_season"
          type="number"
          min="1"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">当前集</label>
        <input
          v-model.number="form.current_episode"
          type="number"
          min="0"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">总集数</label>
        <input
          v-model.number="form.total_episodes"
          type="number"
          min="1"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
    </div>

    <!-- Review -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">短评</label>
      <textarea
        v-model="form.review"
        rows="3"
        placeholder="写点感想..."
        class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
        style="background-color: var(--color-surface); color: var(--color-text)"
      />
    </div>

    <!-- Actions -->
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
