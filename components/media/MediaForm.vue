<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    initialData?: Record<string, any>;
    loading?: boolean;
    isEdit?: boolean;
  }>(),
  { loading: false, isEdit: false },
);

const { proxyUrl } = useImageProxy();

const emit = defineEmits<{ submit: [data: Record<string, any>]; cancel: [] }>();

const form = reactive({
  title: props.initialData?.title || '',
  original_title: props.initialData?.original_title || '',
  type: props.initialData?.type || 'movie',
  year: props.initialData?.year || (undefined as number | undefined),
  director: props.initialData?.director || '',
  actors: props.initialData?.actors || '',
  genres: (() => {
    const g = props.initialData?.genres;
    if (Array.isArray(g)) return g;
    if (typeof g === 'string') {
      try {
        return JSON.parse(g);
      } catch {
        return g ? [g] : [];
      }
    }
    return [];
  })() as string[],
  rating: props.initialData?.rating || 0,
  summary: props.initialData?.summary || '',
  review: props.initialData?.review || '',
  runtime: props.initialData?.runtime || (undefined as number | undefined),
  release_date: props.initialData?.release_date || '',
  imdb_id: props.initialData?.imdb_id || '',
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
    original_title: form.original_title?.trim() || undefined,
    type: form.type,
    year: form.year || undefined,
    director: form.director?.trim() || undefined,
    actors: form.actors?.trim() || undefined,
    genres: form.genres.length > 0 ? form.genres : undefined,
    rating: form.rating || undefined,
    summary: form.summary?.trim() || undefined,
    review: form.review?.trim() || undefined,
    runtime: form.runtime || undefined,
    release_date: form.release_date || undefined,
    imdb_id: form.imdb_id?.trim() || undefined,
    status: form.status,
    current_season: form.current_season,
    current_episode: form.current_episode,
    total_episodes: form.total_episodes || undefined,
    poster_path: form.poster_path || undefined,
    source_id: form.source_id || undefined,
    source_url: form.source_url || undefined,
  });
}

const showSearch = ref(false);

function fillFromSearch(item: Record<string, any>) {
  // Only fill fields that are currently empty (safe for both add and edit mode)
  if (!form.title || form.title === (props.initialData?.title || ''))
    form.title = item.title || form.title;
  if (!form.original_title) form.original_title = item.original_title || '';
  if (!form.year) form.year = item.year || undefined;
  if (!form.director) form.director = item.director || '';
  if (!form.actors) form.actors = item.actors || '';
  if (form.genres.length === 0 && item.genres?.length > 0) form.genres = item.genres;
  if (!form.rating) form.rating = item.rating || 0;
  if (!form.summary) form.summary = item.summary || '';
  if (!form.runtime) form.runtime = item.runtime || undefined;
  if (!form.release_date) form.release_date = item.release_date || '';
  if (!form.imdb_id) form.imdb_id = item.imdb_id || '';
  if (!form.poster_path) form.poster_path = item.poster_path || '';
  if (!form.source_id) form.source_id = item.source_id || '';
  if (!form.source_url) form.source_url = item.source_url || '';
  showSearch.value = false;
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <!-- Poster preview -->
    <div v-if="form.poster_path" class="flex justify-center">
      <div
        class="h-48 w-32 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <img :src="proxyUrl(form.poster_path)" alt="海报" class="h-full w-full object-cover" />
      </div>
    </div>

    <!-- External search -->
    <div v-if="showSearch">
      <MediaSearch @select="fillFromSearch" />
      <p class="mt-2 text-xs text-[var(--color-text-secondary)]">
        或
        <button type="button" class="text-primary-600 hover:underline" @click="showSearch = false">
          手动输入
        </button>
      </p>
    </div>
    <div v-else>
      <button
        type="button"
        class="text-primary-600 inline-flex items-center gap-1 text-sm hover:underline"
        @click="showSearch = true"
      >
        🔍 搜索豆瓣
      </button>
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
      <p v-if="form.original_title" class="mt-1 text-xs text-[var(--color-text-secondary)]">
        原名：{{ form.original_title }}
      </p>
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

    <!-- Genres + Actors -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">类型标签</label>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="g in form.genres"
            :key="g"
            class="inline-flex items-center gap-0.5 rounded-full bg-[var(--color-bg)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
          >
            {{ g }}
            <button
              type="button"
              class="ml-0.5 text-[var(--color-text-secondary)] hover:text-red-500"
              @click="form.genres = form.genres.filter((x) => x !== g)"
            >
              &times;
            </button>
          </span>
          <span v-if="form.genres.length === 0" class="text-xs text-[var(--color-text-secondary)]"
            >—</span
          >
        </div>
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">主演</label>
        <input
          v-model="form.actors"
          type="text"
          placeholder="多个用、分隔"
          class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
    </div>

    <!-- Runtime + Release + IMDB -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
          >片长（分钟）</label
        >
        <input
          v-model.number="form.runtime"
          type="number"
          min="1"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">上映日期</label>
        <input
          v-model="form.release_date"
          type="date"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">IMDB</label>
        <input
          v-model="form.imdb_id"
          type="text"
          placeholder="tt0111161"
          class="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
    </div>

    <!-- Summary -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">简介</label>
      <textarea
        v-model="form.summary"
        rows="3"
        placeholder="剧情简介..."
        class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
        style="background-color: var(--color-surface); color: var(--color-text)"
      />
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
