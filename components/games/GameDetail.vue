<script setup lang="ts">
import { Pencil, Trash2, Gamepad2 } from 'lucide-vue-next';

defineProps<{ game: Record<string, any> }>();
defineEmits<{ edit: [id: number]; delete: [id: number] }>();
const { getLabel, loaded, load } = useDict();
if (!loaded.value) load();
const showDeleteConfirm = ref(false);
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6 flex gap-6">
      <div
        class="h-48 w-48 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <img
          v-if="game.cover_path"
          :src="game.cover_path"
          :alt="game.title"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <Gamepad2 class="h-12 w-12 text-[var(--color-text-secondary)]" />
        </div>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text)]">{{ game.title }}</h1>
        <p class="mt-1 text-[var(--color-text-secondary)]">
          {{ getLabel('platform', game.platform) }}<span v-if="game.year"> · {{ game.year }}</span>
        </p>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <StatusBadge :label="getLabel('platform', game.platform)" />
          <StatusBadge v-if="game.genre" :label="getLabel('game_genre', game.genre)" />
          <StatusBadge :label="getLabel('game_status', game.status)" />
        </div>
        <div v-if="game.rating" class="mt-3">
          <RatingStars :model-value="game.rating" readonly />
        </div>
        <p v-if="game.play_hours" class="mt-1 text-sm text-[var(--color-text-secondary)]">
          游玩 {{ game.play_hours }} 小时
        </p>
      </div>
    </div>
    <div
      v-if="game.review"
      class="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <p class="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-secondary)]">
        {{ game.review }}
      </p>
    </div>
    <div class="flex gap-3 border-t border-[var(--color-border)] pt-6">
      <button
        class="bg-primary-600 hover:bg-primary-700 inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white"
        @click="$emit('edit', game.id)"
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
      title="删除游戏"
      :message="`确定要删除「${game.title}」吗？`"
      confirm-text="删除"
      variant="danger"
      @confirm="
        $emit('delete', game.id);
        showDeleteConfirm = false;
      "
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
