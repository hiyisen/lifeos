<script setup lang="ts">
defineProps<{ items: { module: string; title: string; created_at: string }[] }>();

const moduleIcon: Record<string, string> = {
  food: '🍜',
  media: '🎬',
  game: '🎮',
  book: '📚',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return d.toLocaleDateString('zh-CN');
}
</script>

<template>
  <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
    <h3 class="mb-4 text-sm font-semibold text-[var(--color-text)]">最近动态</h3>
    <div
      v-if="items.length === 0"
      class="py-4 text-center text-sm text-[var(--color-text-secondary)]"
    >
      暂无活动记录
    </div>
    <div v-else class="space-y-0">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="flex items-center gap-3 border-b border-[var(--color-border)] py-2.5 last:border-b-0"
      >
        <span class="text-lg">{{ moduleIcon[item.module] || '📌' }}</span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm text-[var(--color-text)]">{{ item.title }}</p>
          <p class="text-xs text-[var(--color-text-secondary)]">
            {{ formatTime(item.created_at) }}
          </p>
        </div>
        <span class="shrink-0 text-xs text-[var(--color-text-secondary)]">{{ item.module }}</span>
      </div>
    </div>
  </div>
</template>
