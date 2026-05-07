<script setup lang="ts">
import { Upload, X } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    module: string;
    maxFiles?: number;
    accept?: string;
  }>(),
  {
    maxFiles: 9,
    accept: 'image/*',
  },
);

const emit = defineEmits<{
  'update:modelValue': [paths: string[]];
}>();

const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files) uploadFiles(Array.from(input.files));
  input.value = '';
}

async function uploadFiles(files: File[]) {
  const remaining = props.maxFiles - props.modelValue.length;
  if (remaining <= 0) return;

  const formData = new FormData();
  formData.append('module', props.module);
  for (let i = 0; i < Math.min(files.length, remaining); i++) {
    formData.append('files', files[i]);
  }

  uploading.value = true;
  try {
    const res = await $fetch<{ success: boolean; data: string[] }>('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (res.success) {
      emit('update:modelValue', [...props.modelValue, ...res.data]);
    }
  } catch {
    // handle error
  } finally {
    uploading.value = false;
  }
}

function remove(index: number) {
  const newPaths = [...props.modelValue];
  newPaths.splice(index, 1);
  emit('update:modelValue', newPaths);
}

function onDrop(e: DragEvent) {
  isDragOver.value = false;
  if (e.dataTransfer?.files) uploadFiles(Array.from(e.dataTransfer.files));
}
</script>

<template>
  <div>
    <!-- Upload zone -->
    <div
      class="hover:border-primary-400 relative cursor-pointer rounded-xl border-2 border-dashed border-[var(--color-border)] p-4 text-center transition-colors"
      :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-950': isDragOver }"
      @click="fileInput?.click()"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="onDrop"
    >
      <div v-if="uploading" class="flex flex-col items-center gap-2">
        <div
          class="border-primary-600 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
        />
        <span class="text-sm text-[var(--color-text-secondary)]">上传中...</span>
      </div>
      <div v-else class="flex flex-col items-center gap-2">
        <Upload class="h-6 w-6 text-[var(--color-text-secondary)]" />
        <span class="text-sm text-[var(--color-text-secondary)]">
          拖拽或点击上传照片 ({{ modelValue.length }}/{{ maxFiles }})
        </span>
      </div>
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        multiple
        class="hidden"
        @change="onFileSelect"
      />
    </div>

    <!-- Thumbnail grid -->
    <div v-if="modelValue.length > 0" class="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4">
      <div
        v-for="(path, index) in modelValue"
        :key="path"
        class="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)]"
      >
        <img
          :src="path"
          :alt="`照片 ${index + 1}`"
          class="h-full w-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          class="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          @click.stop="remove(index)"
        >
          <X class="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>
</template>
