<script setup lang="ts">
const api = useApi();
const loading = ref(false);
const error = ref('');

async function onSubmit(data: Record<string, any>) {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.post('/api/expenses', data);
    if (res.success) navigateTo('/expenses');
    else error.value = res.error || '保存失败';
  } catch {
    error.value = '网络错误';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <h2 class="mb-6 text-lg font-bold text-[var(--color-text)]">记一笔</h2>
    <div
      v-if="error"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
    >
      {{ error }}
    </div>
    <ExpenseForm :loading="loading" @submit="onSubmit" @cancel="navigateTo('/expenses')" />
  </div>
</template>
