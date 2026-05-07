<script setup lang="ts">
const route = useRoute();

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

const pageTitle = computed(() => {
  // Check exact match first
  if (pageTitles[route.path]) return pageTitles[route.path];
  // Check pattern match for dynamic routes
  if (route.path.startsWith('/foods/') && route.path !== '/foods/add') return '美食详情';
  if (route.path.startsWith('/media/') && route.path !== '/media/add') return '媒体详情';
  if (route.path.startsWith('/games/') && route.path !== '/games/add') return '游戏详情';
  if (route.path.startsWith('/books/') && route.path !== '/books/add') return '书籍详情';
  return 'LifeOS';
});
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm"
  >
    <div class="flex items-center justify-between px-4 py-3 md:px-6">
      <h1 class="text-xl font-bold text-[var(--color-text)]">{{ pageTitle }}</h1>
      <div class="flex items-center gap-2 md:hidden">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
