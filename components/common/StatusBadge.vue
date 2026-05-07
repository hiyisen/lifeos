<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    color?: string | null;
    size?: 'sm' | 'md';
  }>(),
  { size: 'sm', color: null },
);

const colorMap: Record<string, string> = {
  wishlist: '#f59e0b',
  todo: '#f59e0b',
  watching: '#3b82f6',
  reading: '#3b82f6',
  in_progress: '#3b82f6',
  playing: '#3b82f6',
  watched: '#22c55e',
  read: '#22c55e',
  done: '#22c55e',
  completed: '#22c55e',
  dropped: '#9ca3af',
  endless: '#a855f7',
};

function resolveColor(color?: string | null, label?: string): string {
  if (color) return color;
  for (const [key, c] of Object.entries(colorMap)) {
    if (label?.toLowerCase().includes(key)) return c;
  }
  return '#6b7280';
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
    :class="size === 'sm' ? 'text-xs' : 'text-sm'"
    :style="{
      backgroundColor: resolveColor(color, label) + '18',
      color: resolveColor(color, label),
      border: `1px solid ${resolveColor(color, label)}40`,
    }"
  >
    {{ label }}
  </span>
</template>
