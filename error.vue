<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

function handleReset() {
  clearError({ redirect: '/' });
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-4">
    <div class="max-w-md text-center">
      <p class="text-6xl font-bold text-[var(--color-text)]">{{ error.statusCode }}</p>
      <p class="mt-4 text-lg text-[var(--color-text-secondary)]">
        {{ error.statusMessage || '页面出错了' }}
      </p>
      <p v-if="error.message" class="mt-2 text-sm text-[var(--color-text-secondary)]">
        {{ error.message }}
      </p>
      <button
        class="bg-primary-600 hover:bg-primary-700 mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
        @click="handleReset"
      >
        返回首页
      </button>
    </div>
  </div>
</template>
