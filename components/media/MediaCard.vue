<script setup lang="ts">
import { Clapperboard } from 'lucide-vue-next';

defineProps<{ media: Record<string, any> }>();

const { getLabel, getColor, loaded, load } = useDict();
const { proxyUrl } = useImageProxy();
if (!loaded.value) load();

function typeLabel(code: string) {
  return getLabel('media_type', code);
}
function typeColor(code: string) {
  return getColor('media_type', code);
}
function statusLabel(code: string) {
  return getLabel('media_status', code);
}

function parseGenres(genres: any): string[] {
  if (!genres) return [];
  if (Array.isArray(genres)) return genres;
  if (typeof genres === 'string') {
    try {
      return JSON.parse(genres);
    } catch {
      return [];
    }
  }
  return [];
}
</script>

<template>
  <NuxtLink
    :to="`/media/${media.id}`"
    class="group flex gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div
      class="h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg)] sm:h-28 sm:w-20"
    >
      <img
        v-if="media.poster_path"
        :src="proxyUrl(media.poster_path)"
        :alt="media.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <Clapperboard class="h-6 w-6 text-[var(--color-text-secondary)]" />
      </div>
    </div>
    <div class="flex min-w-0 flex-1 flex-col justify-between">
      <div>
        <h3 class="line-clamp-1 font-semibold text-[var(--color-text)]">{{ media.title }}</h3>
        <p
          v-if="media.original_title && media.original_title !== media.title"
          class="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-secondary)]"
        >
          {{ media.original_title }}
        </p>
        <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          <span v-if="media.year">{{ media.year }}</span>
          <span v-if="media.director"> · {{ media.director }}</span>
          <span v-if="media.runtime"> · {{ media.runtime }}分钟</span>
        </p>
        <div v-if="parseGenres(media.genres).length > 0" class="mt-1 flex flex-wrap gap-1">
          <span
            v-for="g in parseGenres(media.genres).slice(0, 3)"
            :key="g"
            class="rounded-full bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]"
            >{{ g }}</span
          >
        </div>
      </div>
      <div class="mt-1.5 flex items-center gap-1.5">
        <StatusBadge :label="typeLabel(media.type)" :color="typeColor(media.type)" size="sm" />
        <StatusBadge :label="statusLabel(media.status)" size="sm" />
        <RatingStars v-if="media.rating" :model-value="media.rating" readonly size="sm" />
      </div>
    </div>
  </NuxtLink>
</template>
