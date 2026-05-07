<script setup lang="ts">
import {
  LayoutDashboard,
  UtensilsCrossed,
  Film,
  Gamepad2,
  Ellipsis,
  X,
  BookOpen,
  Wallet,
  CheckSquare,
  BarChart3,
} from 'lucide-vue-next';
import { ref } from 'vue';

const route = useRoute();
const showMore = ref(false);

const primaryTabs = [
  { label: '首页', icon: LayoutDashboard, to: '/' },
  { label: '美食', icon: UtensilsCrossed, to: '/foods' },
  { label: '媒体', icon: Film, to: '/media' },
  { label: '游戏', icon: Gamepad2, to: '/games' },
];

const moreTabs = [
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
  <nav
    class="fixed right-0 bottom-0 left-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]"
  >
    <div class="flex items-center justify-around py-1">
      <NuxtLink
        v-for="tab in primaryTabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors"
        :class="
          isActive(tab.to)
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-[var(--color-text-secondary)]'
        "
      >
        <component :is="tab.icon" class="h-5 w-5" />
        {{ tab.label }}
      </NuxtLink>

      <!-- More button -->
      <button
        class="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
        @click="showMore = !showMore"
      >
        <Ellipsis class="h-5 w-5" />
        更多
      </button>
    </div>

    <!-- More drawer -->
    <Teleport to="body">
      <div
        v-if="showMore"
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        @click="showMore = false"
      />
      <Transition name="slide-up">
        <div
          v-if="showMore"
          class="fixed right-0 bottom-0 left-0 z-50 rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 pb-8"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="text-sm font-semibold text-[var(--color-text-secondary)]">更多</span>
            <button
              class="rounded-lg p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
              @click="showMore = false"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <NuxtLink
              v-for="tab in moreTabs"
              :key="tab.to"
              :to="tab.to"
              class="flex flex-col items-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors"
              :class="
                isActive(tab.to)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
              "
              @click="showMore = false"
            >
              <component :is="tab.icon" class="h-6 w-6" />
              {{ tab.label }}
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
