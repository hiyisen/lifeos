<script setup lang="ts">
const props = defineProps<{
  food: {
    id: number;
    name: string;
    restaurant?: string | null;
    cuisine_tag?: string | null;
    address?: string | null;
    rating?: number | null;
    price?: number | null;
    photo_paths: string[];
    visited_at: string;
    note?: string | null;
  };
}>();

const { getLabel, getColor, loaded, load } = useDict();
if (!loaded.value) load();

const cuisineLabel = computed(() =>
  props.food.cuisine_tag ? getLabel('cuisine_tag', props.food.cuisine_tag) : '',
);
const cuisineColor = computed(() =>
  props.food.cuisine_tag ? getColor('cuisine_tag', props.food.cuisine_tag) : null,
);

const coverPhoto = computed(() =>
  props.food.photo_paths && props.food.photo_paths.length > 0 ? props.food.photo_paths[0] : null,
);
</script>

<template>
  <NuxtLink
    :to="`/foods/${food.id}`"
    class="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
  >
    <!-- Cover photo -->
    <div class="aspect-[4/3] overflow-hidden bg-[var(--color-bg)]">
      <img
        v-if="coverPhoto"
        :src="coverPhoto"
        :alt="food.name"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="from-primary-100 to-primary-50 dark:from-primary-950 dark:to-primary-900 flex h-full w-full items-center justify-center bg-gradient-to-br"
      >
        <span class="text-4xl">🍜</span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="line-clamp-1 font-semibold text-[var(--color-text)]">{{ food.name }}</h3>
        <RatingStars v-if="food.rating" :model-value="food.rating" readonly size="sm" />
      </div>

      <div class="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <span v-if="food.restaurant" class="text-[var(--color-text-secondary)]">
          {{ food.restaurant }}
        </span>
        <StatusBadge v-if="cuisineLabel" :label="cuisineLabel" :color="cuisineColor" size="sm" />
        <span v-if="food.price" class="ml-auto font-medium text-[var(--color-text)]">
          ¥{{ food.price }}/人
        </span>
      </div>

      <p v-if="food.address" class="mt-1 line-clamp-1 text-xs text-[var(--color-text-secondary)]">
        {{ food.address }}
      </p>
      <p v-if="food.note" class="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-secondary)]">
        {{ food.note }}
      </p>

      <div class="mt-2 text-xs text-[var(--color-text-secondary)]">
        {{ food.visited_at }}
      </div>
    </div>
  </NuxtLink>
</template>
