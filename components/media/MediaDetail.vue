<script setup lang="ts">
import { Pencil, Trash2, Clapperboard } from 'lucide-vue-next';

const props = defineProps<{ media: Record<string, any> }>();
defineEmits<{ edit: [id: number]; delete: [id: number] }>();

const genreList = computed(() => {
  const g = props.media.genres;
  if (Array.isArray(g)) return g;
  if (typeof g === 'string') {
    try {
      return JSON.parse(g);
    } catch {
      return g ? [g] : [];
    }
  }
  return [];
});

const { getLabel, getColor, loaded, load } = useDict();
const { proxyUrl } = useImageProxy();
if (!loaded.value) load();

const showDeleteConfirm = ref(false);
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:gap-6">
      <div
        class="h-44 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] sm:h-56 sm:w-40"
      >
        <img
          v-if="media.poster_path"
          :src="proxyUrl(media.poster_path)"
          :alt="media.title"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <Clapperboard class="h-10 w-10 text-[var(--color-text-secondary)]" />
        </div>
      </div>
      <div class="flex flex-col justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[var(--color-text)]">{{ media.title }}</h1>
          <p v-if="media.original_title" class="text-sm text-[var(--color-text-secondary)]">
            {{ media.original_title }}
          </p>
          <p class="mt-1 text-[var(--color-text-secondary)]">
            {{ media.year || '' }}
            <span v-if="media.director">· {{ media.director }}</span>
          </p>
          <p v-if="media.actors" class="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            主演：{{ media.actors }}
          </p>
          <div
            class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)]"
          >
            <span v-if="media.runtime">片长 {{ media.runtime }} 分钟</span>
            <span v-if="media.release_date">上映 {{ media.release_date }}</span>
            <span v-if="media.viewed_at" class="font-medium text-[var(--color-text)]">观影 {{ media.viewed_at }}</span>
            <a
              v-if="media.imdb_id"
              :href="`https://www.imdb.com/title/${media.imdb_id}`"
              target="_blank"
              class="text-primary-600 hover:underline"
              >IMDB</a
            >
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <StatusBadge
              :label="getLabel('media_type', media.type)"
              :color="getColor('media_type', media.type)"
            />
            <StatusBadge :label="getLabel('media_status', media.status)" />
          </div>
          <div v-if="genreList.length > 0" class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="g in genreList"
              :key="g"
              class="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
              >{{ g }}</span
            >
          </div>
          <div v-if="media.rating" class="mt-3">
            <RatingStars :model-value="media.rating" readonly />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="media.summary"
      class="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <h3 class="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">简介</h3>
      <p class="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-secondary)]">
        {{ media.summary }}
      </p>
    </div>

    <div
      v-if="media.review"
      class="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <h3 class="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">短评</h3>
      <p class="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-secondary)]">
        {{ media.review }}
      </p>
    </div>

    <div class="flex gap-3 border-t border-[var(--color-border)] pt-6">
      <button
        class="bg-primary-600 hover:bg-primary-700 inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white"
        @click="$emit('edit', media.id)"
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
      title="删除媒体"
      :message="`确定要删除「${media.title}」吗？`"
      confirm-text="删除"
      variant="danger"
      @confirm="
        $emit('delete', media.id);
        showDeleteConfirm = false;
      "
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
