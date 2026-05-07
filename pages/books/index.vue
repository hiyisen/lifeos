<script setup lang="ts">
import { BookOpen, Filter, X } from 'lucide-vue-next';
const api = useApi();
const { loaded, load } = useDict();
const books = ref<any[]>([]);
const loading = ref(true);
const total = ref(0);
const page = ref(1);
const search = ref('');
const type = ref('');
const status = ref('');
const showFilters = ref(false);

async function fetch() {
  loading.value = true;
  const res = await api.get('/api/books', {
    page: page.value,
    limit: 20,
    search: search.value || undefined,
    type: type.value || undefined,
    status: status.value || undefined,
  });
  if (res.success) {
    books.value = res.data;
    total.value = res.meta?.total ?? 0;
  }
  loading.value = false;
}
function clear() {
  search.value = '';
  type.value = '';
  status.value = '';
  page.value = 1;
}
watch([search, type, status, page], () => fetch());
onMounted(async () => {
  if (!loaded.value) await load();
  fetch();
});
</script>

<template>
  <div>
    <div class="mb-6 flex items-center gap-3">
      <div class="flex-1"><SearchInput v-model="search" placeholder="搜索书名或作者..." /></div>
      <button
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors"
        :class="
          showFilters
            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400'
            : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
        "
        @click="showFilters = !showFilters"
      >
        <Filter class="h-4 w-4" />筛选
      </button>
    </div>
    <div
      v-if="showFilters"
      class="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <div class="w-40">
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">类型</label
        ><DictSelect v-model="type" category="book_type" placeholder="全部" clearable />
      </div>
      <div class="w-40">
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">状态</label
        ><DictSelect v-model="status" category="book_status" placeholder="全部" clearable />
      </div>
      <button
        class="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
        @click="clear"
      >
        <X class="h-4 w-4" />清除
      </button>
    </div>
    <div v-if="loading && books.length === 0" class="flex justify-center py-16">
      <div
        class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>
    <EmptyState
      v-else-if="books.length === 0"
      title="还没有书籍记录"
      description="开始记录你的阅读轨迹吧"
      :icon="BookOpen"
      action-label="添加书籍"
      @action="navigateTo('/books/add')"
    />
    <div v-else class="space-y-3"><BookCard v-for="b in books" :key="b.id" :book="b" /></div>
    <FabButton to="/books/add" />
  </div>
</template>
