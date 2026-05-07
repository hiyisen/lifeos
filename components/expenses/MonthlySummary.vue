<script setup lang="ts">
const props = defineProps<{ year: number; month: number }>();

const summary = ref<any>(null);
const loading = ref(true);

async function fetch() {
  loading.value = true;
  try {
    const api = useApi();
    const res = await api.get('/api/expenses/summary', { year: props.year, month: props.month });
    if (res.success) summary.value = res.data;
  } finally {
    loading.value = false;
  }
}

onMounted(fetch);
watch(() => [props.year, props.month], fetch);

const { getLabel } = useDict();
</script>

<template>
  <div v-if="summary" class="space-y-4">
    <div class="grid grid-cols-3 gap-3">
      <div
        class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center"
      >
        <p class="text-xs text-[var(--color-text-secondary)]">支出</p>
        <p class="text-lg font-bold text-red-600 dark:text-red-400">
          ¥{{ summary.totalExpense.toFixed(2) }}
        </p>
      </div>
      <div
        class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center"
      >
        <p class="text-xs text-[var(--color-text-secondary)]">收入</p>
        <p class="text-lg font-bold text-green-600 dark:text-green-400">
          ¥{{ summary.totalIncome.toFixed(2) }}
        </p>
      </div>
      <div
        class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center"
      >
        <p class="text-xs text-[var(--color-text-secondary)]">结余</p>
        <p
          class="text-lg font-bold"
          :class="summary.net >= 0 ? 'text-[var(--color-text)]' : 'text-red-600'"
        >
          ¥{{ summary.net.toFixed(2) }}
        </p>
      </div>
    </div>

    <div
      v-if="summary.byCategory?.length"
      class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <h3 class="mb-2 text-sm font-semibold text-[var(--color-text)]">分类支出</h3>
      <div
        v-for="cat in summary.byCategory"
        :key="cat.category"
        class="mb-2 flex items-center gap-2 text-sm"
      >
        <span class="w-20 text-[var(--color-text-secondary)]">{{
          getLabel('expense_category', cat.category)
        }}</span>
        <div class="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg)]">
          <div
            class="bg-primary-500 h-full rounded-full"
            :style="{ width: `${(cat.amount / summary.totalExpense) * 100 || 0}%` }"
          />
        </div>
        <span class="w-20 text-right font-medium text-[var(--color-text)]"
          >¥{{ cat.amount.toFixed(0) }}</span
        >
      </div>
    </div>
  </div>
</template>
