<script setup lang="ts">
const route = useRoute();
const api = useApi();
const food = ref<any>(null);
const loading = ref(true);
const saving = ref(false);
const error = ref('');

async function fetchFood() {
  loading.value = true;
  try {
    const res = await api.get(`/api/foods/${route.params.id}`);
    if (res.success) {
      food.value = res.data;
    } else {
      error.value = res.error || '加载失败';
    }
  } catch {
    error.value = '网络错误';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchFood);

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
  saving.value = true;
  error.value = '';
  try {
    const res = await api.put(`/api/foods/${route.params.id}`, data);
    if (res.success) {
      navigateTo(`/foods/${route.params.id}`);
    } else {
      error.value = res.error || '保存失败';
    }
  } catch {
    error.value = '网络错误，请重试';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <h2 class="mb-6 text-lg font-bold text-[var(--color-text)]">编辑美食记录</h2>

    <div
      v-if="error"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
    >
      {{ error }}
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <div
        class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>

    <FoodForm
      v-else-if="food"
      :initial-data="food"
      :loading="saving"
      @submit="onSubmit"
      @cancel="navigateTo(`/foods/${route.params.id}`)"
    />
  </div>
</template>
