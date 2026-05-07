<script setup lang="ts">
import { Star } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    modelValue: 0,
    readonly: false,
    size: 'md',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const sizeMap = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-6 w-6' };

function getStarFill(starIndex: number): 'full' | 'half' | 'empty' {
  const val = props.modelValue;
  const threshold = starIndex * 2;
  if (val >= threshold) return 'full';
  if (val >= threshold - 1) return 'half';
  return 'empty';
}

function setRating(starIndex: number) {
  if (props.readonly) return;
  emit('update:modelValue', starIndex * 2);
}
</script>

<template>
  <div class="inline-flex items-center gap-0.5">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      :disabled="props.readonly"
      class="relative transition-transform"
      :class="[
        sizeMap[props.size],
        props.readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
      ]"
      @click="setRating(i)"
    >
      <!-- Empty star -->
      <Star
        class="absolute inset-0"
        :class="sizeMap[size]"
        :stroke-width="1.5"
        fill="none"
        stroke="currentColor"
        :style="{ color: 'var(--color-border)' }"
      />
      <!-- Filled overlay -->
      <div
        class="absolute inset-0 overflow-hidden"
        :style="{
          width: getStarFill(i) === 'full' ? '100%' : getStarFill(i) === 'half' ? '50%' : '0%',
        }"
      >
        <Star :class="sizeMap[size]" :stroke-width="1.5" fill="#f59e0b" stroke="#f59e0b" />
      </div>
    </button>
    <span
      v-if="modelValue > 0"
      class="ml-1 font-semibold text-[var(--color-text)]"
      :class="props.size === 'sm' ? 'text-xs' : 'text-sm'"
    >
      {{ modelValue }}
    </span>
  </div>
</template>
