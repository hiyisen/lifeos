<script setup lang="ts">
const route = useRoute();
const api = useApi();
const food = ref<any>(null);
const loading = ref(true);
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

function onEdit(id: number) {
  navigateTo(`/foods/${id}/edit`);
}

async function onDelete(id: number) {
  try {
    const res = await api.del(`/api/foods/${id}`);
    if (res.success) {
      navigateTo('/foods');
    }
  } catch {
    // handle error
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
      <button class="text-primary-600 hover:text-primary-700 mt-4" @click="fetchFood">重试</button>
    </div>

    <FoodDetail v-else-if="food" :food="food" @edit="onEdit" @delete="onDelete" />
  </div>
</template>
