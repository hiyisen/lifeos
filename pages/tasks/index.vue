<script setup lang="ts">
import { CheckSquare } from 'lucide-vue-next';
const api = useApi();
const { loaded, load } = useDict();
const tasks = ref<any[]>([]);
const loading = ref(true);
const showAddForm = ref(false);
const addForm = reactive({ title: '', priority: 'medium' as string, category: '', due_date: '' });
const saving = ref(false);
const error = ref('');

async function fetch() {
  loading.value = true;
  const res = await api.get('/api/tasks');
  if (res.success) tasks.value = res.data;
  loading.value = false;
}

async function onStatusUpdate(id: number, status: string) {
  try {
    await api.patch(`/api/tasks/${id}/status`, { status });
    const t = tasks.value.find((x) => x.id === id);
    if (t) t.status = status;
  } catch {
    error.value = '操作失败，请重试';
  }
}

async function onDelete(id: number) {
  try {
    await api.del(`/api/tasks/${id}`);
    tasks.value = tasks.value.filter((t) => t.id !== id);
  } catch {
    error.value = '删除失败，请重试';
  }
}

async function onAdd() {
  if (!addForm.title.trim()) return;
  saving.value = true;
  try {
    const res = await api.post('/api/tasks', {
      title: addForm.title.trim(),
      priority: addForm.priority,
      category: addForm.category || undefined,
      due_date: addForm.due_date || undefined,
    });
    if (res.success) {
      tasks.value.unshift(res.data);
      addForm.title = '';
      addForm.priority = 'medium';
      addForm.category = '';
      addForm.due_date = '';
      showAddForm.value = false;
    }
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (!loaded.value) await load();
  fetch();
});
</script>

<template>
  <div>
    <div
      v-if="error"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
    >
      {{ error }}
      <button class="ml-2 underline" @click="error = ''">关闭</button>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <div
        class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>

    <!-- Quick add -->
    <div class="mb-6">
      <button
        v-if="!showAddForm && !loading"
        class="hover:border-primary-400 hover:text-primary-600 inline-flex items-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)]"
        @click="showAddForm = true"
      >
        + 添加任务
      </button>
      <form
        v-else
        class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        @submit.prevent="onAdd"
      >
        <input
          v-model="addForm.title"
          type="text"
          placeholder="任务标题..."
          class="focus:border-primary-500 mb-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none"
          autofocus
        />
        <div class="flex items-center gap-2">
          <select
            v-model="addForm.priority"
            class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-xs text-[var(--color-text)]"
          >
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
          <input
            v-model="addForm.due_date"
            type="date"
            class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-xs text-[var(--color-text)]"
          />
          <button
            type="submit"
            :disabled="saving"
            class="bg-primary-600 hover:bg-primary-700 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
          >
            添加
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
            @click="showAddForm = false"
          >
            取消
          </button>
        </div>
      </form>
    </div>

    <EmptyState
      v-if="tasks.length === 0 && !loading"
      title="还没有任务"
      description="创建你的第一个待办事项吧"
      :icon="CheckSquare"
    />

    <TaskKanban
      v-else
      :tasks="tasks"
      @update:status="onStatusUpdate"
      @delete="onDelete"
      @add="showAddForm = true"
    />
  </div>
</template>
