<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next';

const { theme, setTheme } = useTheme();

const modes: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: '亮色' },
  { value: 'dark', icon: Moon, label: '暗色' },
  { value: 'system', icon: Monitor, label: '跟随系统' },
];

const currentMode = computed(() => modes.find((m) => m.value === theme.value) ?? modes[2]);

function cycle() {
  const idx = modes.findIndex((m) => m.value === theme.value);
  const next = modes[(idx + 1) % modes.length];
  setTheme(next.value);
}
</script>

<template>
  <button
    class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
    :title="modes.find((m) => m.value === theme)?.label"
    @click="cycle"
  >
    <component :is="currentMode.icon" class="h-5 w-5" />
    <span>{{ currentMode.label }}</span>
  </button>
</template>
