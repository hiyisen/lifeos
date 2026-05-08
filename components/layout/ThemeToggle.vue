<script setup lang="ts">
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-vue-next';

withDefaults(defineProps<{ dropUp?: boolean }>(), { dropUp: true });

const { theme, setTheme } = useTheme();

const modes: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: '亮色' },
  { value: 'dark', icon: Moon, label: '暗色' },
  { value: 'system', icon: Monitor, label: '跟随系统' },
];

const currentMode = computed(() => modes.find((m) => m.value === theme.value) ?? modes[2]);

const open = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

onClickOutside(dropdownRef, () => {
  open.value = false;
});

function select(value: 'light' | 'dark' | 'system') {
  setTheme(value);
  open.value = false;
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
      @click="open = !open"
    >
      <component :is="currentMode.icon" class="h-5 w-5" />
      <span class="flex-1 text-left">{{ currentMode.label }}</span>
      <ChevronDown class="h-3.5 w-3.5 transition-transform" :class="{ 'rotate-180': open }" />
    </button>

    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute left-0 z-50 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
        :class="dropUp ? 'bottom-full mb-1' : 'top-full mt-1'"
      >
        <button
          v-for="mode in modes"
          :key="mode.value"
          class="flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-[var(--color-bg)]"
          :class="
            theme === mode.value
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-[var(--color-text)]'
          "
          @click="select(mode.value)"
        >
          <component :is="mode.icon" class="h-4 w-4" />
          {{ mode.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>
