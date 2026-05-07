<script setup lang="ts">
const route = useRoute();
const api = useApi();
const expense = ref<any>(null);
const loading = ref(true);
const error = ref('');

async function fetchExpense() {
  loading.value = true;
  try {
    const res = await api.get(`/api/expenses/${route.params.id}`);
    if (res.success) {
      expense.value = res.data;
    } else {
      error.value = res.error || '加载失败';
    }
  } catch {
    error.value = '网络错误';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchExpense);

function onEdit(id: number) {
  navigateTo(`/expenses/${id}/edit`);
}

async function onDelete(id: number) {
  try {
    const res = await api.del(`/api/expenses/${id}`);
    if (res.success) {
      useToast().success('记录已删除');
      navigateTo('/expenses');
    }
  } catch {
    useToast().error('删除失败，请重试');
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center py-16">
      <div
        class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>

    <div v-else-if="error" class="py-16 text-center">
      <p class="text-[var(--color-text-secondary)]">{{ error }}</p>
      <button class="text-primary-600 hover:text-primary-700 mt-4" @click="fetchExpense">
        重试
      </button>
    </div>

    <ExpenseDetail v-else-if="expense" :expense="expense" @edit="onEdit" @delete="onDelete" />
  </div>
</template>
