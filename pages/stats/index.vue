<script setup lang="ts">
import * as echarts from 'echarts';
const api = useApi();
const { loaded, load } = useDict();

const modules = [
  { key: 'foods', label: '美食记录', icon: '🍜' },
  { key: 'media', label: '媒体库', icon: '🎬' },
  { key: 'games', label: '游戏库', icon: '🎮' },
  { key: 'books', label: '书库', icon: '📚' },
  { key: 'expenses', label: '记账', icon: '💰' },
  { key: 'tasks', label: '任务', icon: '✅' },
];

const activeModule = ref('foods');
const loading = ref(false);
const stats = ref<any>(null);
const ratingChartRef = ref<HTMLDivElement>();
const trendChartRef = ref<HTMLDivElement>();
let ratingChart: echarts.ECharts | null = null;
let trendChart: echarts.ECharts | null = null;
let unmounted = false;

const hasRating = computed(() => ['foods', 'media', 'games', 'books'].includes(activeModule.value));

async function fetchStats() {
  loading.value = true;
  const res = await api.get(`/api/stats/${activeModule.value}`);
  if (res.success) {
    stats.value = res.data;
    if (!unmounted) await nextTick();
    if (!unmounted) renderCharts();
  }
  loading.value = false;
}

function renderCharts() {
  if (!stats.value) return;

  // Rating distribution chart
  if (ratingChartRef.value && stats.value.ratingDist?.length) {
    ratingChart?.dispose();
    ratingChart = echarts.init(ratingChartRef.value);
    const dist = stats.value.ratingDist as { rating: number; count: number }[];
    ratingChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dist.map((d) => `${d.rating}分`),
        axisLabel: { fontSize: 11 },
      },
      yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
      series: [
        {
          type: 'bar',
          data: dist.map((d) => d.count),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#f59e0b' },
              { offset: 1, color: '#fbbf24' },
            ]),
          },
        },
      ],
    });
  }

  // Monthly trend chart
  if (trendChartRef.value && stats.value.monthlyTrend?.length) {
    trendChart?.dispose();
    trendChart = echarts.init(trendChartRef.value);
    const trend = (stats.value.monthlyTrend as { month: string; count: number }[])
      .slice()
      .reverse();
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: trend.map((d) => d.month),
        axisLabel: { fontSize: 11, rotate: 45 },
      },
      yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
      series: [
        {
          type: 'line',
          data: trend.map((d) => d.count),
          smooth: true,
          lineStyle: { color: '#6366f1', width: 2 },
          itemStyle: { color: '#6366f1' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99,102,241,0.3)' },
              { offset: 1, color: 'rgba(99,102,241,0.05)' },
            ]),
          },
        },
      ],
    });
  }
}

function handleResize() {
  ratingChart?.resize();
  trendChart?.resize();
}

watch(activeModule, () => {
  fetchStats();
});

onMounted(async () => {
  if (!loaded.value) await load();
  fetchStats();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  unmounted = true;
  window.removeEventListener('resize', handleResize);
  ratingChart?.dispose();
  trendChart?.dispose();
});
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-[var(--color-text)]">统计分析</h1>

    <!-- Module tabs -->
    <div class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="mod in modules"
        :key="mod.key"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
        :class="
          activeModule === mod.key
            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400'
            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
        "
        @click="activeModule = mod.key"
      >
        <span>{{ mod.icon }}</span> {{ mod.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div
        class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>

    <template v-else-if="stats">
      <!-- Summary cards -->
      <div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <div
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
        >
          <p class="text-xs text-[var(--color-text-secondary)]">总计</p>
          <p class="mt-1 text-2xl font-bold text-[var(--color-text)]">{{ stats.total }}</p>
        </div>
        <div
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
        >
          <p class="text-xs text-[var(--color-text-secondary)]">今年新增</p>
          <p class="text-primary-600 mt-1 text-2xl font-bold">{{ stats.thisYear }}</p>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Rating distribution -->
        <div
          v-if="hasRating && stats.ratingDist?.length"
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <h3 class="mb-4 text-sm font-semibold text-[var(--color-text)]">评分分布</h3>
          <div ref="ratingChartRef" class="h-64 w-full" />
          <div
            v-if="stats.ratingDist.length === 0"
            class="py-8 text-center text-sm text-[var(--color-text-secondary)]"
          >
            暂无评分数据
          </div>
        </div>

        <!-- Monthly trend -->
        <div
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          :class="!hasRating || !stats.ratingDist?.length ? 'lg:col-span-2' : ''"
        >
          <h3 class="mb-4 text-sm font-semibold text-[var(--color-text)]">月度趋势</h3>
          <div v-if="stats.monthlyTrend?.length" ref="trendChartRef" class="h-64 w-full" />
          <div v-else class="py-8 text-center text-sm text-[var(--color-text-secondary)]">
            暂无数据
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
