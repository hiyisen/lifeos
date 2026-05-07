<script setup lang="ts">
import { Plus, type Component } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    to: string;
    icon?: Component;
  }>(),
  {
    icon: undefined,
  },
);
</script>

<template>
  <NuxtLink
    :to="to"
    class="bg-primary-600 hover:bg-primary-700 fixed right-6 bottom-24 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:shadow-xl active:scale-95 md:right-8 md:bottom-8"
  >
    <component :is="icon || Plus" class="h-6 w-6" />
  </NuxtLink>
</template>
