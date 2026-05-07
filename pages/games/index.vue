<script setup lang="ts">
import { Gamepad2, Filter, X } from 'lucide-vue-next';
const api = useApi();
const { loaded, load } = useDict();
const games = ref<any[]>([]);
const loading = ref(true);
const total = ref(0);
const page = ref(1);
const limit = 20;
const totalPages = computed(() => Math.ceil(total.value / limit));
const search = ref('');
const platform = ref('');
const status = ref('');
const showFilters = ref(false);

async function fetch() {
  loading.value = true;
  const res = await api.get('/api/games', {
    page: page.value,
    limit,
    search: search.value || undefined,
    platform: platform.value || undefined,
    status: status.value || undefined,
  });
  if (res.success) {
    games.value = res.data;
    total.value = res.meta?.total ?? 0;
  }
  loading.value = false;
}
function clear() {
  search.value = '';
  platform.value = '';
  status.value = '';
  page.value = 1;
}
watch([search, platform, status, page], () => fetch());
onMounted(async () => {
  if (!loaded.value) await load();
  fetch();
});
</script>

<template>
  <div>
    <div class="mb-6 flex items-center gap-3">
      <div class="flex-1"><SearchInput v-model="search" placeholder="搜索游戏..." /></div>
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
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">平台</label
        ><DictSelect v-model="platform" category="platform" placeholder="全部" clearable />
      </div>
      <div class="w-40">
        <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">状态</label
        ><DictSelect v-model="status" category="game_status" placeholder="全部" clearable />
      </div>
      <button
        class="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
        @click="clear"
      >
        <X class="h-4 w-4" />清除
      </button>
    </div>
    <div v-if="loading && games.length === 0" class="flex justify-center py-16">
      <div
        class="border-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>
    <EmptyState
      v-else-if="games.length === 0"
      title="还没有游戏记录"
      description="开始记录你玩过的游戏吧"
      :icon="Gamepad2"
      action-label="添加游戏"
      @action="navigateTo('/games/add')"
    />
    <div v-else class="space-y-3"><GameCard v-for="g in games" :key="g.id" :game="g" /></div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
      <button
        :disabled="page <= 1"
        class="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)] disabled:opacity-30"
        @click="page--"
      >
        上一页
      </button>
      <span class="text-sm text-[var(--color-text-secondary)]">
        {{ page }} / {{ totalPages }}
      </span>
      <button
        :disabled="page >= totalPages"
        class="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)] disabled:opacity-30"
        @click="page++"
      >
        下一页
      </button>
    </div>

    <FabButton to="/games/add" />
  </div>
</template>
