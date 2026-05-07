<script setup lang="ts">
import { Wallet, Filter, X } from 'lucide-vue-next';
const api = useApi();
const { loaded, load, getLabel } = useDict();
const expenses = ref<any[]>([]);
const loading = ref(true);
const total = ref(0);
const page = ref(1);
const category = ref('');
const type = ref('');
const search = ref('');
const showFilters = ref(false);
const now = new Date();
const summaryYear = ref(now.getFullYear());
const summaryMonth = ref(now.getMonth() + 1);

async function fetch() {
  loading.value = true;
  const res = await api.get('/api/expenses', {
    page: page.value,
    limit: 30,
    category: category.value || undefined,
    type: type.value || undefined,
    search: search.value || undefined,
  });
  if (res.success) {
    expenses.value = res.data;
    total.value = res.meta?.total ?? 0;
  }
  loading.value = false;
}

function clear() {
  category.value = '';
  type.value = '';
  search.value = '';
  page.value = 1;
}
watch([category, type, search, page], () => fetch());
onMounted(async () => {
  if (!loaded.value) await load();
  fetch();
});
</script>

<template>
  <div>
    <MonthlySummary :year="summaryYear" :month="summaryMonth" class="mb-6" />

    <div class="mb-6 flex items-center gap-3">
      <div class="flex-1"><SearchInput v-model="search" placeholder="搜索备注..." /></div>
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
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">分类</label
        ><DictSelect
          v-model="category"
          category="expense_category"
          placeholder="全部分类"
          clearable
        />
      </div>
      <div class="w-32">
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">类型</label
        ><select
          v-model="type"
          class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
        >
          <option value="">全部</option>
          <option value="expense">支出</option>
          <option value="income">收入</option>
        </select>
      </div>
      <button
        class="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
        @click="clear"
      >
        <X class="h-4 w-4" />清除
      </button>
    </div>

    <div v-if="loading && expenses.length === 0" class="flex justify-center py-16">
      <div
        class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>
    <EmptyState
      v-else-if="expenses.length === 0"
      title="还没有记账记录"
      description="开始记录你的收支吧"
      :icon="Wallet"
      action-label="记一笔"
      @action="navigateTo('/expenses/add')"
    />

    <div v-else class="space-y-1">
      <div
        v-for="exp in expenses"
        :key="exp.id"
        class="flex items-center justify-between rounded-lg px-4 py-2.5 hover:bg-[var(--color-bg)]"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg">{{ exp.type === 'income' ? '💰' : '💸' }}</span>
          <div>
            <p class="text-sm font-medium text-[var(--color-text)]">
              {{ getLabel('expense_category', exp.category) }}
            </p>
            <p class="text-xs text-[var(--color-text-secondary)]">
              {{ exp.record_date }}<span v-if="exp.note"> · {{ exp.note }}</span>
            </p>
          </div>
        </div>
        <span
          class="font-semibold"
          :class="
            exp.type === 'income'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          "
        >
          {{ exp.type === 'income' ? '+' : '-' }}¥{{ Math.abs(exp.amount).toFixed(2) }}
        </span>
      </div>
    </div>

    <FabButton to="/expenses/add" />
  </div>
</template>
