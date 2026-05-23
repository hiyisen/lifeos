<script setup lang="ts">
import { Wallet, Filter, X, Trash2 } from 'lucide-vue-next';

const api = useApi();
const { loaded, load, getLabel } = useDict();

const category = ref('');
const type = ref('');
const search = ref('');
const showFilters = ref(false);

const sortOptions = [
  { value: 'record_date', label: '记账日期' },
  { value: 'amount_desc', label: '金额最大' },
  { value: 'amount_asc', label: '金额最小' },
  { value: 'created_at', label: '最近添加' },
];

const { items: expenses, loading, initialLoading, hasMore, sort, setSort, sentinel, fetch, reset } =
  useInfiniteList({
    fetchFn: (page, limit, sort) =>
      api.get('/api/expenses', {
        page,
        limit,
        sort: sort || undefined,
        category: category.value || undefined,
        type: type.value || undefined,
        search: search.value || undefined,
      }),
    initialSort: 'record_date',
  });

const deleteTarget = ref<any>(null);
const showDeleteConfirm = ref(false);

function clear() {
  category.value = '';
  type.value = '';
  search.value = '';
  reset();
}

async function onDelete(id: number) {
  try {
    await api.del(`/api/expenses/${id}`);
    (expenses.value as any[]).splice(
      (expenses.value as any[]).findIndex((e) => e.id === id),
      1,
    );
    useToast().success('记录已删除');
  } catch {
    useToast().error('删除失败，请重试');
  } finally {
    showDeleteConfirm.value = false;
  }
}

watch([category, type, search], () => reset());

onMounted(async () => {
  if (!loaded.value) await load();
  fetch(true);
});
</script>

<template>
  <div>
    <MonthlySummary :year="new Date().getFullYear()" :month="new Date().getMonth() + 1" class="mb-6" />

    <div class="mb-4 flex items-center gap-3">
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
      class="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <div class="w-full sm:w-40">
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">分类</label
        ><DictSelect
          v-model="category"
          category="expense_category"
          placeholder="全部分类"
          clearable
        />
      </div>
      <div class="w-full sm:w-32">
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

    <!-- Sort pills -->
    <div class="mb-4 flex flex-wrap gap-1.5">
      <button
        v-for="opt in sortOptions"
        :key="opt.value"
        class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
        :class="
          sort === opt.value
            ? 'bg-primary-600 text-white'
            : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
        "
        @click="setSort(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="initialLoading" class="flex justify-center py-16">
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
        class="group flex cursor-pointer items-center justify-between rounded-lg px-4 py-2.5 hover:bg-[var(--color-bg)]"
        @click="navigateTo(`/expenses/${exp.id}`)"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg">{{ exp.type === 'income' ? '💰' : '💸' }}</span>
          <div>
            <p class="text-sm font-medium text-[var(--color-text)]">
              {{ getLabel('expense_category', exp.category) }}
            </p>
            <p class="text-xs text-[var(--color-text-secondary)]">
              {{ exp.record_date }}
              <span v-if="exp.payment_method">
                · {{ getLabel('payment_method', exp.payment_method) }}</span
              >
              <span v-if="exp.note"> · {{ exp.note }}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
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
          <button
            type="button"
            class="rounded p-1 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            @click.stop="
              deleteTarget = exp;
              showDeleteConfirm = true;
            "
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="flex justify-center py-8">
        <div
          v-if="loading"
          class="border-primary-600 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
        />
        <span v-else-if="!hasMore && expenses.length > 0" class="text-xs text-[var(--color-text-secondary)]">已加载全部</span>
      </div>
    </div>

    <ConfirmDialog
      :open="showDeleteConfirm"
      title="删除记账记录"
      :message="`确定要删除这条记录吗？此操作不可撤销。`"
      variant="danger"
      @confirm="onDelete(deleteTarget?.id)"
      @cancel="showDeleteConfirm = false"
    />

    <FabButton to="/expenses/add" />
  </div>
</template>
