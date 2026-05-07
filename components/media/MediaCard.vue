<script setup lang="ts">
import { Clapperboard } from 'lucide-vue-next';

defineProps<{
  media: {
    id: number;
    title: string;
    type: string;
    year?: number | null;
    director?: string | null;
    rating?: number | null;
    poster_path?: string | null;
    status: string;
  };
}>();

const { getLabel, getColor, loaded, load } = useDict();
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
</script>

<template>
  <NuxtLink
    :to="`/media/${media.id}`"
    class="group flex gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div class="h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg)] sm:h-28 sm:w-20">
      <img
        v-if="media.poster_path"
        :src="media.poster_path"
        :alt="media.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <Clapperboard class="h-6 w-6 text-[var(--color-text-secondary)]" />
      </div>
    </div>
    <div class="flex flex-1 flex-col justify-between">
      <div>
        <h3 class="line-clamp-1 font-semibold text-[var(--color-text)]">{{ media.title }}</h3>
        <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          {{ media.year || '' }}
          <span v-if="media.director">· {{ media.director }}</span>
        </p>
      </div>
      <div class="flex items-center gap-1.5">
        <StatusBadge :label="typeLabel(media.type)" :color="typeColor(media.type)" size="sm" />
        <StatusBadge :label="statusLabel(media.status)" size="sm" />
        <RatingStars v-if="media.rating" :model-value="media.rating" readonly size="sm" />
      </div>
    </div>
  </NuxtLink>
</template>
