<script setup lang="ts">
defineProps<{ weeklyNew: Record<string, number> }>();

const config = {
  foods: { label: '美食', icon: '🍜', color: 'bg-orange-50 dark:bg-orange-950', to: '/foods' },
  media: { label: '媒体', icon: '🎬', color: 'bg-blue-50 dark:bg-blue-950', to: '/media' },
  games: { label: '游戏', icon: '🎮', color: 'bg-purple-50 dark:bg-purple-950', to: '/games' },
  books: { label: '书籍', icon: '📚', color: 'bg-green-50 dark:bg-green-950', to: '/books' },
};
</script>

<template>
  <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
    <NuxtLink
      v-for="(cfg, key) in config"
      :key="key"
      :to="cfg.to"
      class="hover:border-primary-300 flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-4 transition-colors"
      :class="cfg.color"
    >
      <span class="text-2xl">{{ cfg.icon }}</span>
      <div>
        <p class="text-2xl font-bold text-[var(--color-text)]">{{ weeklyNew[key] ?? 0 }}</p>
        <p class="text-xs text-[var(--color-text-secondary)]">本周新增{{ cfg.label }}</p>
      </div>
    </NuxtLink>
  </div>
</template>
