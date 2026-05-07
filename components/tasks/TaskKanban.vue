<script setup lang="ts">
import { Plus } from 'lucide-vue-next';

const props = defineProps<{ tasks: Record<string, any>[] }>();
const emit = defineEmits<{
  'update:status': [id: number, status: string];
  delete: [id: number];
  edit: [id: number];
  add: [];
}>();

const columns = [
  { key: 'todo', label: '待办', color: '#f59e0b' },
  { key: 'in_progress', label: '进行中', color: '#3b82f6' },
  { key: 'done', label: '已完成', color: '#22c55e' },
];

function getTasks(status: string) {
  return props.tasks.filter((t) => t.status === status);
}

function onDragStart(e: DragEvent, taskId: number) {
  e.dataTransfer?.setData('text/plain', String(taskId));
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
}

function onDrop(e: DragEvent, status: string) {
  e.preventDefault();
  const taskId = Number(e.dataTransfer?.getData('text/plain'));
  if (taskId) emit('update:status', taskId, status);
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <div
      v-for="col in columns"
      :key="col.key"
      class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
      @dragover="onDragOver"
      @drop="(e: DragEvent) => onDrop(e, col.key)"
    >
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: col.color }" />
          <span class="text-sm font-semibold text-[var(--color-text)]">{{ col.label }}</span>
          <span class="text-xs text-[var(--color-text-secondary)]"
            >({{ getTasks(col.key).length }})</span
          >
        </div>
        <button
          v-if="col.key === 'todo'"
          class="rounded-lg p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          @click="$emit('add')"
        >
          <Plus class="h-4 w-4" />
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="task in getTasks(col.key)"
          :key="task.id"
          draggable="true"
          class="cursor-grab active:cursor-grabbing"
          @dragstart="(e: DragEvent) => onDragStart(e, task.id)"
        >
          <TaskCard
            :task="task"
            compact
            @update:status="(id: number, s: string) => $emit('update:status', id, s)"
            @delete="(id: number) => $emit('delete', id)"
            @edit="(id: number) => $emit('edit', id)"
          />
        </div>

        <div
          v-if="getTasks(col.key).length === 0"
          class="rounded-lg border border-dashed border-[var(--color-border)] py-8 text-center text-xs text-[var(--color-text-secondary)]"
        >
          拖拽任务到此处
        </div>
      </div>
    </div>
  </div>
</template>
