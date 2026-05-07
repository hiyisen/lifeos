<script setup lang="ts">
import { Star } from 'lucide-vue-next';

defineProps<{
  topRated: Record<string, { id: number; name?: string; title?: string; rating: number }[]>;
}>();

const config: Record<string, { label: string; icon: string; to: (id: number) => string }> = {
  foods: { label: '美食', icon: '🍜', to: (id) => `/foods/${id}` },
  media: { label: '影视', icon: '🎬', to: (id) => `/media/${id}` },
  games: { label: '游戏', icon: '🎮', to: (id) => `/games/${id}` },
  books: { label: '书籍', icon: '📚', to: (id) => `/books/${id}` },
};
</script>

<template>
  <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
    <h3 class="mb-4 text-sm font-semibold text-[var(--color-text)]">高分推荐</h3>

    <div class="space-y-4">
      <div v-for="(cfg, key) in config" :key="key">
        <div
          class="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
        >
          <span>{{ cfg.icon }}</span> {{ cfg.label }}
        </div>
        <div v-if="!topRated[key]?.length" class="text-xs text-[var(--color-text-secondary)]">
          暂无评分
        </div>
        <NuxtLink
          v-for="item in topRated[key]"
          :key="item.id"
          :to="cfg.to(item.id)"
          class="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-[var(--color-bg)]"
        >
          <span class="truncate text-[var(--color-text)]">{{ item.name || item.title }}</span>
          <span class="flex shrink-0 items-center gap-0.5 text-xs font-medium text-amber-500">
            <Star class="h-3 w-3 fill-current" />{{ item.rating }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
