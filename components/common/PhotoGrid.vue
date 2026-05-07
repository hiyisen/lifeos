<script setup lang="ts">
import { X } from 'lucide-vue-next';

defineProps<{
  paths: string[];
  editable?: boolean;
}>();

const emit = defineEmits<{
  delete: [index: number];
}>();

const lightboxIndex = ref(-1);

function openLightbox(index: number) {
  lightboxIndex.value = index;
}

function closeLightbox() {
  lightboxIndex.value = -1;
}
</script>

<template>
  <div>
    <!-- Grid -->
    <div class="grid gap-2" :class="paths.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'">
      <div
        v-for="(path, index) in paths"
        :key="path"
        class="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-[var(--color-border)]"
        @click="openLightbox(index)"
      >
        <img
          :src="path"
          :alt="`照片 ${index + 1}`"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <button
          v-if="editable"
          class="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          @click.stop="emit('delete', index)"
        >
          <X class="h-3 w-3" />
        </button>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxIndex >= 0"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          @click="closeLightbox"
        >
          <button
            class="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            @click="closeLightbox"
          >
            <X class="h-6 w-6" />
          </button>
          <img
            :src="paths[lightboxIndex]"
            class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
