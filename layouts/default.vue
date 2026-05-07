<script setup lang="ts">
const isMobile = useMediaQuery('(max-width: 767px)');
</script>

<template>
  <div class="flex min-h-screen bg-[var(--color-bg)]">
    <!-- Desktop sidebar -->
    <AppSidebar v-if="!isMobile" />

    <!-- Main content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <NuxtPage />
      </main>
    </div>

    <!-- Mobile bottom tab bar -->
    <AppBottomTab v-if="isMobile" />
  </div>
</template>
