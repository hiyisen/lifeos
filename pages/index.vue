<script setup lang="ts">
const api = useApi();
const { loaded, load } = useDict();

const loading = ref(true);
const dashboard = ref<any>(null);

onMounted(async () => {
  if (!loaded.value) await load();
  const res = await api.get('/api/stats/dashboard');
  if (res.success) dashboard.value = res.data;
  loading.value = false;
});
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-[var(--color-text)]">仪表盘</h1>

    <!-- Quick actions -->
    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <NuxtLink
        to="/foods/add"
        class="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-sm font-medium text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <span class="text-xl">🍜</span>
        记录美食
      </NuxtLink>
      <NuxtLink
        to="/expenses/add"
        class="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-sm font-medium text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <span class="text-xl">💸</span>
        记一笔
      </NuxtLink>
      <NuxtLink
        to="/media/add"
        class="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-sm font-medium text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <span class="text-xl">🎬</span>
        添加影视
      </NuxtLink>
      <NuxtLink
        to="/books/add"
        class="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-sm font-medium text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <span class="text-xl">📖</span>
        添加书籍
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <div
        class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>

    <template v-else-if="dashboard">
      <OverviewCards :weekly-new="dashboard.weeklyNew" class="mb-6" />

      <div class="mb-6 grid gap-6 lg:grid-cols-2">
        <ExpenseChart />
        <div class="space-y-6">
          <InProgressList :in-progress="dashboard.inProgress" />
          <TopRated :top-rated="dashboard.topRated" />
        </div>
      </div>

      <ActivityTimeline :items="dashboard.recentActivity" class="mb-6" />
    </template>

    <div v-else class="py-16 text-center text-[var(--color-text-secondary)]">
      <p>加载仪表盘失败</p>
      <button
        class="text-primary-600 mt-3 text-sm hover:underline"
        @click="
          loading = true;
          api.get('/api/stats/dashboard').then((r) => {
            if (r.success) dashboard = r.data;
            loading = false;
          });
        "
      >
        重试
      </button>
    </div>
  </div>
</template>
