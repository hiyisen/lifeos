<script setup lang="ts">
import { Play, Gamepad2, BookOpen, CheckCircle2 } from 'lucide-vue-next';

defineProps<{
  inProgress: {
    media: { id: number; title: string; status: string }[];
    games: { id: number; title: string; status: string }[];
    books: { id: number; title: string; status: string }[];
    tasks: { id: number; title: string; priority: string; due_date: string }[];
  };
}>();

const priorityColor: Record<string, string> = {
  high: 'text-red-600 dark:text-red-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-green-600 dark:text-green-400',
};
</script>

<template>
  <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
    <h3 class="mb-4 text-sm font-semibold text-[var(--color-text)]">进行中</h3>

    <div class="space-y-4">
      <!-- Media -->
      <div>
        <div
          class="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
        >
          <Play class="h-3.5 w-3.5" /> 正在观看
        </div>
        <div
          v-if="inProgress.media.length === 0"
          class="text-xs text-[var(--color-text-secondary)]"
        >
          暂无
        </div>
        <NuxtLink
          v-for="m in inProgress.media"
          :key="m.id"
          :to="`/media/${m.id}`"
          class="block truncate rounded px-2 py-1 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >{{ m.title }}</NuxtLink
        >
      </div>

      <!-- Games -->
      <div>
        <div
          class="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
        >
          <Gamepad2 class="h-3.5 w-3.5" /> 正在游玩
        </div>
        <div
          v-if="inProgress.games.length === 0"
          class="text-xs text-[var(--color-text-secondary)]"
        >
          暂无
        </div>
        <NuxtLink
          v-for="g in inProgress.games"
          :key="g.id"
          :to="`/games/${g.id}`"
          class="block truncate rounded px-2 py-1 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >{{ g.title }}</NuxtLink
        >
      </div>

      <!-- Books -->
      <div>
        <div
          class="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
        >
          <BookOpen class="h-3.5 w-3.5" /> 正在阅读
        </div>
        <div
          v-if="inProgress.books.length === 0"
          class="text-xs text-[var(--color-text-secondary)]"
        >
          暂无
        </div>
        <NuxtLink
          v-for="b in inProgress.books"
          :key="b.id"
          :to="`/books/${b.id}`"
          class="block truncate rounded px-2 py-1 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >{{ b.title }}</NuxtLink
        >
      </div>

      <!-- Tasks -->
      <div>
        <div
          class="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
        >
          <CheckCircle2 class="h-3.5 w-3.5" /> 待办任务
        </div>
        <div
          v-if="inProgress.tasks.length === 0"
          class="text-xs text-[var(--color-text-secondary)]"
        >
          暂无
        </div>
        <NuxtLink
          v-for="t in inProgress.tasks"
          :key="t.id"
          :to="`/tasks`"
          class="flex items-center gap-2 rounded px-2 py-1 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          <span class="flex-1 truncate">{{ t.title }}</span>
          <span class="text-xs" :class="priorityColor[t.priority] || ''">{{ t.priority }}</span>
          <span class="text-xs text-[var(--color-text-secondary)]">{{ t.due_date }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
