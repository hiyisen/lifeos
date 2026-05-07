<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  title: string;
  description?: string;
  actionLabel?: string;
  icon?: Component;
  filtered?: boolean;
}>();

defineEmits<{
  action: [];
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div
      v-if="icon"
      class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
    >
      <component :is="icon" class="h-8 w-8" />
    </div>
    <h3 class="mb-1 text-lg font-semibold text-[var(--color-text)]">
      {{ filtered ? '没有找到匹配的结果' : title }}
    </h3>
    <p v-if="filtered" class="mb-6 max-w-sm text-sm text-[var(--color-text-secondary)]">
      试试调整筛选条件
    </p>
    <p v-else-if="description" class="mb-6 max-w-sm text-sm text-[var(--color-text-secondary)]">
      {{ description }}
    </p>
    <button
      v-if="actionLabel"
      class="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
    <slot />
    <slot name="action" />
  </div>
</template>
