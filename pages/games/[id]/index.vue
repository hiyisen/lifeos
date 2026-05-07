<script setup lang="ts">
const route = useRoute();
const api = useApi();
const game = ref<any>(null);
const loading = ref(true);
const error = ref('');
onMounted(async () => {
  try {
    const res = await api.get(`/api/games/${route.params.id}`);
    if (res.success) game.value = res.data;
    else error.value = res.error || '加载失败';
  } catch {
    error.value = '网络错误';
  } finally {
    loading.value = false;
  }
});
async function onDelete(id: number) {
  try {
    const res = await api.del(`/api/games/${id}`);
    if (res.success) navigateTo('/games');
    else error.value = res.error || '删除失败';
  } catch {
    error.value = '网络错误，请重试';
  }
}
</script>

<template>
  <div v-if="loading" class="flex justify-center py-16">
    <div
      class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
    />
  </div>
  <div v-else-if="error" class="py-16 text-center">
    <p class="text-[var(--color-text-secondary)]">{{ error }}</p>
  </div>
  <GameDetail
    v-else-if="game"
    :game="game"
    @edit="(id: number) => navigateTo(`/games/${id}/edit`)"
    @delete="onDelete"
  />
</template>
