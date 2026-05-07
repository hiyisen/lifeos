<script setup lang="ts">
const route = useRoute();
const api = useApi();
const book = ref<any>(null);
const loading = ref(true);
const error = ref('');
onMounted(async () => {
  try {
    const res = await api.get(`/api/books/${route.params.id}`);
    if (res.success) book.value = res.data;
    else error.value = res.error || '加载失败';
  } catch {
    error.value = '网络错误';
  } finally {
    loading.value = false;
  }
});
async function onDelete(id: number) {
  await api.del(`/api/books/${id}`);
  navigateTo('/books');
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
  <BookDetail
    v-else-if="book"
    :book="book"
    @edit="(id: number) => navigateTo(`/books/${id}/edit`)"
    @delete="onDelete"
  />
</template>
