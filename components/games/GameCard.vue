<script setup lang="ts">
import { Gamepad2 } from 'lucide-vue-next';

defineProps<{ game: Record<string, any> }>();
const { getLabel } = useDict();
</script>

<template>
  <NuxtLink
    :to="`/games/${game.id}`"
    class="group flex gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg)]">
      <img
        v-if="game.cover_path"
        :src="game.cover_path"
        :alt="game.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <Gamepad2 class="h-6 w-6 text-[var(--color-text-secondary)]" />
      </div>
    </div>
    <div class="flex flex-1 flex-col justify-between">
      <div>
        <h3 class="line-clamp-1 font-semibold text-[var(--color-text)]">{{ game.title }}</h3>
        <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          {{ getLabel('platform', game.platform) }}<span v-if="game.year"> · {{ game.year }}</span>
        </p>
      </div>
      <div class="flex items-center gap-1.5">
        <StatusBadge :label="getLabel('platform', game.platform)" size="sm" />
        <StatusBadge :label="getLabel('game_status', game.status)" size="sm" />
        <RatingStars v-if="game.rating" :model-value="game.rating" readonly size="sm" />
      </div>
    </div>
  </NuxtLink>
</template>
