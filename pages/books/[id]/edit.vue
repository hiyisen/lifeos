<script setup lang="ts">
const route = useRoute();
const api = useApi();
const book = ref<any>(null);
const loading = ref(true);
const saving = ref(false);
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
async function onSubmit(data: Record<string, any>) {
  saving.value = true;
  error.value = '';
  try {
    const res = await api.put(`/api/books/${route.params.id}`, data);
    if (res.success) navigateTo(`/books/${route.params.id}`);
    else error.value = res.error || '保存失败';
  } catch {
    error.value = '网络错误';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <h2 class="mb-6 text-lg font-bold text-[var(--color-text)]">编辑书籍</h2>
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
    <BookForm
      v-else-if="book"
      :initial-data="book"
      :loading="saving"
      is-edit
      @submit="onSubmit"
      @cancel="navigateTo(`/books/${route.params.id}`)"
    />
  </div>
</template>
