<script setup lang="ts">
import { Gamepad2 } from 'lucide-vue-next';

defineProps<{ game: Record<string, any> }>();
const { getLabel } = useDict();
const { proxyUrl, thumbnailUrl } = useImageProxy();
</script>

<template>
  <NuxtLink
    :to="`/games/${game.id}`"
    class="group flex gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div
      class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg)] sm:h-24 sm:w-24"
    >
      <img
        v-if="game.cover_path"
        :src="thumbnailUrl(game.cover_path)"
        :alt="game.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <Gamepad2 class="h-6 w-6 text-[var(--color-text-secondary)]" />
      </div>
    </div>
    <div class="flex min-w-0 flex-1 flex-col justify-between">
      <div>
        <h3 class="line-clamp-1 font-semibold text-[var(--color-text)]">{{ game.title }}</h3>
        <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          <span>{{ getLabel('platform', game.platform) }}</span>
          <span v-if="game.year"> · {{ game.year }}</span>
          <span v-if="game.genre"> · {{ game.genre }}</span>
          <span v-if="game.play_hours"> · {{ game.play_hours }}小时</span>
        </p>
      </div>
      <div class="mt-1.5 flex items-center gap-1.5">
        <StatusBadge :label="getLabel('game_status', game.status)" size="sm" />
        <RatingStars v-if="game.rating" :model-value="game.rating" readonly size="sm" />
      </div>
    </div>
  </NuxtLink>
</template>
