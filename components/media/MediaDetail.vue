<script setup lang="ts">
import { Pencil, Trash2, Clapperboard } from 'lucide-vue-next';

defineProps<{ media: Record<string, any> }>();
defineEmits<{ edit: [id: number]; delete: [id: number] }>();

const { getLabel, getColor, loaded, load } = useDict();
if (!loaded.value) load();

const showDeleteConfirm = ref(false);
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:gap-6">
      <div
        class="h-44 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] sm:h-56 sm:w-40"
      >
        <img
          v-if="media.poster_path"
          :src="media.poster_path"
          :alt="media.title"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <Clapperboard class="h-10 w-10 text-[var(--color-text-secondary)]" />
        </div>
      </div>
      <div class="flex flex-col justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[var(--color-text)]">{{ media.title }}</h1>
          <p class="mt-1 text-[var(--color-text-secondary)]">
            {{ media.year || '' }}
            <span v-if="media.director">· {{ media.director }}</span>
          </p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <StatusBadge
              :label="getLabel('media_type', media.type)"
              :color="getColor('media_type', media.type)"
            />
            <StatusBadge :label="getLabel('media_status', media.status)" />
          </div>
          <div v-if="media.rating" class="mt-3">
            <RatingStars :model-value="media.rating" readonly />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="media.review"
      class="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <p class="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-secondary)]">
        {{ media.review }}
      </p>
    </div>

    <div class="flex gap-3 border-t border-[var(--color-border)] pt-6">
      <button
        class="bg-primary-600 hover:bg-primary-700 inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white"
        @click="$emit('edit', media.id)"
      >
        <Pencil class="h-4 w-4" />编辑
      </button>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
        @click="showDeleteConfirm = true"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>

    <ConfirmDialog
      :open="showDeleteConfirm"
      title="删除媒体"
      :message="`确定要删除「${media.title}」吗？`"
      confirm-text="删除"
      variant="danger"
      @confirm="
        $emit('delete', media.id);
        showDeleteConfirm = false;
      "
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
