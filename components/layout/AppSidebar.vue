<script setup lang="ts">
import {
  LayoutDashboard,
  UtensilsCrossed,
  Film,
  Gamepad2,
  BookOpen,
  Wallet,
  CheckSquare,
  BarChart3,
  Clock,
} from 'lucide-vue-next';

const route = useRoute();

const navItems = [
  { label: '首页', icon: LayoutDashboard, to: '/' },
  { label: '时间轴', icon: Clock, to: '/timeline' },
  { label: '美食', icon: UtensilsCrossed, to: '/foods' },
  { label: '媒体', icon: Film, to: '/media' },
  { label: '游戏', icon: Gamepad2, to: '/games' },
  { label: '书籍', icon: BookOpen, to: '/books' },
  { label: '记账', icon: Wallet, to: '/expenses' },
  { label: '任务', icon: CheckSquare, to: '/tasks' },
  { label: '统计', icon: BarChart3, to: '/stats' },
];

function isActive(to: string) {
  if (to === '/') return route.path === '/';
  return route.path.startsWith(to);
}
</script>

<template>
  <aside
    class="sticky top-0 flex h-screen w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-6 py-5">
      <div
        class="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white"
      >
        L
      </div>
      <span class="text-lg font-bold text-[var(--color-text)]">LifeOS</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 px-3 py-2">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="
          isActive(item.to)
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
        "
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- Bottom section -->
    <div class="border-t border-[var(--color-border)] px-3 py-3">
      <ThemeToggle />
    </div>
  </aside>
</template>
