<script setup lang="ts">
import { X, CheckCircle, AlertCircle, Info } from 'lucide-vue-next';

const { toasts, remove } = useToast();

const icons: Record<string, any> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors: Record<string, string> = {
  success:
    'border-green-400 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-400',
  error:
    'border-red-400 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-400',
  info: 'border-blue-400 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400',
};
</script>

<template>
  <div class="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg"
        :class="colors[toast.type]"
      >
        <component :is="icons[toast.type]" class="h-4 w-4 shrink-0" />
        <span>{{ toast.message }}</span>
        <button class="ml-2 shrink-0 opacity-60 hover:opacity-100" @click="remove(toast.id)">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>
