<script setup lang="ts">
import { Trash2, Calendar, CheckCircle2, Circle, Play } from 'lucide-vue-next';

defineProps<{ task: Record<string, any>; compact?: boolean }>();
const emit = defineEmits<{
  'update:status': [id: number, status: string];
  delete: [id: number];
  edit: [id: number];
}>();

const showDeleteConfirm = ref(false);

const { getLabel } = useDict();

const priorityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

function cycleStatus(task: Record<string, any>) {
  const next =
    task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
  emit('update:status', task.id, next);
}
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:shadow-sm"
    :class="{ 'opacity-60': task.status === 'done' }"
  >
    <button class="mt-0.5 flex-shrink-0" type="button" @click="cycleStatus(task)">
      <CheckCircle2 v-if="task.status === 'done'" class="h-5 w-5 text-green-500" />
      <Play v-else-if="task.status === 'in_progress'" class="h-5 w-5 text-blue-500" />
      <Circle v-else class="h-5 w-5 text-[var(--color-border)]" />
    </button>
    <div class="min-w-0 flex-1">
      <p
        class="line-clamp-1 font-medium text-[var(--color-text)]"
        :class="{ 'line-through': task.status === 'done' }"
      >
        {{ task.title }}
      </p>
      <div class="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
        <span
          class="flex items-center gap-0.5 text-[var(--color-text-secondary)]"
          :style="{ color: priorityColors[task.priority] || '' }"
          >● {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}</span
        >
        <span
          v-if="task.due_date"
          class="inline-flex items-center gap-0.5 text-[var(--color-text-secondary)]"
          ><Calendar class="h-3 w-3" />{{ task.due_date }}</span
        >
        <StatusBadge
          v-if="task.category"
          :label="getLabel('task_category', task.category)"
          size="sm"
        />
      </div>
    </div>
    <button
      type="button"
      class="flex-shrink-0 rounded p-1 text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
      @click="showDeleteConfirm = true"
    >
      <Trash2 class="h-4 w-4" />
    </button>
    <ConfirmDialog
      :open="showDeleteConfirm"
      title="删除任务"
      :message="`确定要删除「${task.title}」吗？此操作不可撤销。`"
      variant="danger"
      @confirm="
        emit('delete', task.id);
        showDeleteConfirm = false;
      "
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
