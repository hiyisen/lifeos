<script setup lang="ts">
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next';

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

function prev(e: Event) {
  e.stopPropagation();
  if (lightboxIndex.value > 0) lightboxIndex.value--;
}

function next(e: Event) {
  e.stopPropagation();
  const paths = document.querySelectorAll('[data-photo]');
  if (lightboxIndex.value < paths.length - 1) lightboxIndex.value++;
}

function onKeydown(e: KeyboardEvent) {
  if (lightboxIndex.value < 0) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxIndex.value = Math.max(0, lightboxIndex.value - 1);
  if (e.key === 'ArrowRight')
    lightboxIndex.value = Math.min(
      document.querySelectorAll('[data-photo]').length - 1,
      lightboxIndex.value + 1,
    );
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div>
    <!-- Grid -->
    <div class="grid gap-2" :class="paths.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'">
      <div
        v-for="(path, index) in paths"
        :key="path"
        data-photo
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
          class="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-red-600 active:bg-red-700"
          @click.stop="emit('delete', index)"
        >
          <X class="h-4 w-4" />
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

          <!-- Prev -->
          <button
            v-if="lightboxIndex > 0"
            class="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            @click="prev"
          >
            <ChevronLeft class="h-6 w-6" />
          </button>

          <!-- Next -->
          <button
            v-if="lightboxIndex < paths.length - 1"
            class="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            @click="next"
          >
            <ChevronRight class="h-6 w-6" />
          </button>

          <!-- Counter -->
          <div
            class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white"
          >
            {{ lightboxIndex + 1 }} / {{ paths.length }}
          </div>

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
