<script setup lang="ts">
import * as echarts from 'echarts';

const api = useApi();
const { loaded, load, getLabel } = useDict();
const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

const loading = ref(true);
const summary = ref<{
  totalExpense: number;
  totalIncome: number;
  net: number;
  byCategory: { category: string; amount: number }[];
  dailyExpenses: { date: string; amount: number }[];
}>();

onMounted(async () => {
  if (!loaded.value) await load();
  const now = new Date();
  const res = await api.get('/api/expenses/summary', {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  if (res.success) {
    summary.value = res.data;
  }
  loading.value = false;
  await nextTick();
  initChart();
});

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);

  const data = summary.value;
  const dates = data?.dailyExpenses.map((d) => d.date.slice(-2)) || [];
  const amounts = data?.dailyExpenses.map((d) => d.amount) || [];
  chart?.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
    series: [
      {
        name: '支出',
        type: 'bar',
        data: amounts,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f97316' },
            { offset: 1, color: '#fb923c' },
          ]),
        },
      },
    ],
  });

  window.addEventListener('resize', () => chart?.resize());
}

onUnmounted(() => {
  chart?.dispose();
});
</script>

<template>
  <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
    <h3 class="mb-4 text-sm font-semibold text-[var(--color-text)]">本月收支</h3>

    <div v-if="loading" class="flex justify-center py-8">
      <div
        class="border-primary-600 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>

    <template v-else-if="summary">
      <!-- Summary bar -->
      <div class="mb-4 flex gap-4">
        <div class="flex-1 rounded-lg bg-red-50 p-3 text-center dark:bg-red-950">
          <p class="text-xs text-[var(--color-text-secondary)]">支出</p>
          <p class="text-lg font-bold text-red-600 dark:text-red-400">
            ¥{{ summary.totalExpense.toFixed(0) }}
          </p>
        </div>
        <div class="flex-1 rounded-lg bg-green-50 p-3 text-center dark:bg-green-950">
          <p class="text-xs text-[var(--color-text-secondary)]">收入</p>
          <p class="text-lg font-bold text-green-600 dark:text-green-400">
            ¥{{ summary.totalIncome.toFixed(0) }}
          </p>
        </div>
        <div
          class="flex-1 rounded-lg p-3 text-center"
          :class="summary.net >= 0 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-red-50 dark:bg-red-950'"
        >
          <p class="text-xs text-[var(--color-text-secondary)]">结余</p>
          <p
            class="text-lg font-bold"
            :class="
              summary.net >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-red-600 dark:text-red-400'
            "
          >
            ¥{{ summary.net.toFixed(0) }}
          </p>
        </div>
      </div>

      <!-- Chart -->
      <div ref="chartRef" class="h-48 w-full" />

      <!-- Category breakdown -->
      <div v-if="summary.byCategory.length" class="mt-4 space-y-2">
        <p class="text-xs font-medium text-[var(--color-text-secondary)]">分类支出</p>
        <div
          v-for="cat in summary.byCategory.slice(0, 5)"
          :key="cat.category"
          class="flex items-center gap-2"
        >
          <span class="w-16 shrink-0 text-xs text-[var(--color-text-secondary)]">{{
            getLabel('expense_category', cat.category)
          }}</span>
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-bg)]">
            <div
              class="h-full rounded-full bg-orange-500"
              :style="{ width: `${summary ? (cat.amount / summary.totalExpense) * 100 : 0}%` }"
            />
          </div>
          <span class="text-xs font-medium text-[var(--color-text)]"
            >¥{{ cat.amount.toFixed(0) }}</span
          >
        </div>
      </div>
    </template>
  </div>
</template>
