<script setup lang="ts">
import { Pencil, Trash2, MapPin, Calendar } from 'lucide-vue-next';

const props = defineProps<{
  food: {
    id: number;
    name: string;
    restaurant?: string | null;
    cuisine_tag?: string | null;
    address?: string | null;
    rating?: number | null;
    price?: number | null;
    photo_paths: string[];
    note?: string | null;
    visited_at: string;
    created_at?: string;
  };
}>();

defineEmits<{
  edit: [id: number];
  delete: [id: number];
}>();

const { getLabel, getColor, loaded, load } = useDict();
if (!loaded.value) load();

const cuisineLabel = computed(() =>
  props.food.cuisine_tag ? getLabel('cuisine_tag', props.food.cuisine_tag) : '',
);
const cuisineColor = computed(() =>
  props.food.cuisine_tag ? getColor('cuisine_tag', props.food.cuisine_tag) : null,
);

const coverPhoto = computed(() =>
  props.food.photo_paths && props.food.photo_paths.length > 0 ? props.food.photo_paths[0] : null,
);

const restPhotos = computed(() =>
  props.food.photo_paths && props.food.photo_paths.length > 1
    ? props.food.photo_paths.slice(1)
    : [],
);

const showDeleteConfirm = ref(false);
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <!-- Hero photo -->
    <div
      class="mb-6 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
      :class="coverPhoto ? 'aspect-[16/10]' : ''"
    >
      <img
        v-if="coverPhoto"
        :src="coverPhoto"
        :alt="food.name"
        class="h-full w-full object-cover"
      />
      <div
        v-else
        class="from-primary-100 to-primary-50 dark:from-primary-950 dark:to-primary-900 flex aspect-[16/10] items-center justify-center bg-gradient-to-br"
      >
        <span class="text-6xl">🍜</span>
      </div>
    </div>

    <!-- Title + Rating -->
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text)]">{{ food.name }}</h1>
        <p v-if="food.restaurant" class="mt-1 text-[var(--color-text-secondary)]">
          {{ food.restaurant }}
        </p>
      </div>
      <div class="text-right">
        <RatingStars v-if="food.rating" :model-value="food.rating" readonly />
        <span
          v-if="food.price"
          class="text-primary-600 dark:text-primary-400 mt-1 block text-right text-xl font-bold"
        >
          ¥{{ food.price }}
          <span class="text-xs font-normal text-[var(--color-text-secondary)]">/人</span>
        </span>
      </div>
    </div>

    <!-- Meta chips -->
    <div class="mb-6 flex flex-wrap items-center gap-2">
      <StatusBadge v-if="cuisineLabel" :label="cuisineLabel" :color="cuisineColor" />
      <span
        v-if="food.address"
        class="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
      >
        <MapPin class="h-3 w-3" />
        {{ food.address }}
      </span>
      <span
        class="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
      >
        <Calendar class="h-3 w-3" />
        {{ food.visited_at }}
      </span>
    </div>

    <!-- Note -->
    <div
      v-if="food.note"
      class="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <p class="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-secondary)]">
        {{ food.note }}
      </p>
    </div>

    <!-- Other photos -->
    <PhotoGrid v-if="restPhotos.length > 0" :paths="restPhotos" class="mb-6" />

    <!-- Actions -->
    <div class="flex gap-3 border-t border-[var(--color-border)] pt-6">
      <button
        class="bg-primary-600 hover:bg-primary-700 inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
        @click="$emit('edit', food.id)"
      >
        <Pencil class="h-4 w-4" />
        编辑
      </button>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
        @click="showDeleteConfirm = true"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>

    <ConfirmDialog
      :open="showDeleteConfirm"
      title="删除美食记录"
      :message="`确定要删除「${food.name}」吗？此操作不可撤销。`"
      confirm-text="删除"
      variant="danger"
      @confirm="
        $emit('delete', food.id);
        showDeleteConfirm = false;
      "
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
