<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    debounce?: number;
  }>(),
  {
    placeholder: '搜索...',
    debounce: 300,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const localValue = ref(props.modelValue);
const debouncedValue = refDebounced(localValue, props.debounce);

watch(debouncedValue, (val) => {
  emit('update:modelValue', val);
});

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val;
  },
);

function clear() {
  localValue.value = '';
}
</script>

<template>
  <div class="relative">
    <Search
      class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
    />
    <input
      v-model="localValue"
      type="text"
      :placeholder="placeholder"
      class="focus:border-primary-400 focus:ring-primary-500 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-8 pl-9 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:ring-1 focus:outline-none"
    />
    <button
      v-if="localValue"
      class="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      @click="clear"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>
