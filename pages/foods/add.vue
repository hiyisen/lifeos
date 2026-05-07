<script setup lang="ts">
const api = useApi();
const loading = ref(false);
const error = ref('');

async function onSubmit(data: {
  name: string;
  restaurant?: string;
  cuisine_tag?: string;
  address?: string;
  rating?: number;
  price?: number;
  photo_paths: string[];
  note?: string;
  visited_at: string;
}) {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.post('/api/foods', data);
    if (res.success) {
      navigateTo(`/foods/${res.data.id}`);
    } else {
      error.value = res.error || '保存失败';
    }
  } catch {
    error.value = '网络错误，请重试';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <h2 class="mb-6 text-lg font-bold text-[var(--color-text)]">添加美食记录</h2>

    <div
      v-if="error"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
    >
      {{ error }}
    </div>

    <FoodForm :loading="loading" @submit="onSubmit" @cancel="navigateTo('/foods')" />
  </div>
</template>
