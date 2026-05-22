<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const isMobile = useMediaQuery('(max-width: 767px)');

const pageTitles: Record<string, string> = {
  '/': '首页',
  '/foods': '美食记录',
  '/foods/add': '添加美食',
  '/media': '媒体库',
  '/media/add': '添加媒体',
  '/games': '游戏库',
  '/games/add': '添加游戏',
  '/books': '书库',
  '/books/add': '添加书籍',
  '/expenses': '记账',
  '/expenses/add': '记一笔',
  '/tasks': '任务管理',
  '/stats': '数据统计',
};

const isSubPage = computed(() => {
  const p = route.path;
  return (
    /^\/foods\/\d+/.test(p) ||
    /^\/media\/\d+/.test(p) ||
    /^\/games\/\d+/.test(p) ||
    /^\/books\/\d+/.test(p) ||
    /^\/expenses\/\d+/.test(p)
  );
});

const pageTitle = computed(() => {
  if (pageTitles[route.path]) return pageTitles[route.path];
  const isEdit = route.path.endsWith('/edit');
  const basePath = isEdit ? route.path.slice(0, -5) : route.path;
  if (basePath.match(/^\/foods\/\d+$/)) return isEdit ? '编辑美食' : '美食详情';
  if (basePath.match(/^\/media\/\d+$/)) return isEdit ? '编辑媒体' : '媒体详情';
  if (basePath.match(/^\/games\/\d+$/)) return isEdit ? '编辑游戏' : '游戏详情';
  if (basePath.match(/^\/books\/\d+$/)) return isEdit ? '编辑书籍' : '书籍详情';
  if (basePath.match(/^\/expenses\/\d+$/)) return isEdit ? '编辑记录' : '记录详情';
  return 'LifeOS';
});

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    // Fallback: navigate to parent module list
    const parent = route.path.replace(/\/\d+.*/, '');
    router.push(parent || '/');
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm"
  >
    <div class="flex items-center gap-2 px-4 py-3 md:px-6">
      <button
        v-if="isSubPage"
        class="-ml-1 rounded-lg p-1 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
        @click="goBack"
      >
        <ChevronLeft class="h-6 w-6" />
      </button>
      <h1 class="text-xl font-bold text-[var(--color-text)]">{{ pageTitle }}</h1>
      <div v-if="isMobile" class="ml-auto flex items-center gap-2">
        <ThemeToggle :drop-up="false" />
      </div>
    </div>
  </header>
</template>
