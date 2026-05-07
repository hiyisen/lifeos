<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}>();

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('cancel')" />

        <!-- Dialog -->
        <div
          class="relative w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl"
        >
          <h3 class="mb-2 text-lg font-semibold text-[var(--color-text)]">{{ title }}</h3>
          <p class="mb-6 text-sm text-[var(--color-text-secondary)]">{{ message }}</p>
          <div class="flex justify-end gap-3">
            <button
              class="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)]"
              @click="$emit('cancel')"
            >
              {{ cancelText || '取消' }}
            </button>
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              :class="
                variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              "
              @click="$emit('confirm')"
            >
              {{ confirmText || '确认' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > :not(:first-child),
.modal-leave-active > :not(:first-child) {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > :not(:first-child) {
  transform: scale(0.95);
}
.modal-leave-to > :not(:first-child) {
  transform: scale(0.95);
}
</style>
