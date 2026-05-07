<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    initialData?: {
      id?: number;
      name?: string;
      restaurant?: string;
      cuisine_tag?: string;
      address?: string;
      rating?: number;
      price?: number;
      photo_paths?: string[];
      note?: string;
      visited_at?: string;
    };
    loading?: boolean;
  }>(),
  { loading: false },
);

const emit = defineEmits<{
  submit: [
    data: {
      name: string;
      restaurant?: string;
      cuisine_tag?: string;
      address?: string;
      rating?: number;
      price?: number;
      photo_paths: string[];
      note?: string;
      visited_at: string;
    },
  ];
  cancel: [];
}>();

const today = () => new Date().toISOString().split('T')[0];

const form = reactive({
  name: props.initialData?.name || '',
  restaurant: props.initialData?.restaurant || '',
  cuisine_tag: props.initialData?.cuisine_tag || '',
  address: props.initialData?.address || '',
  rating: props.initialData?.rating || 0,
  price: props.initialData?.price || (undefined as number | undefined),
  photo_paths: props.initialData?.photo_paths || [],
  note: props.initialData?.note || '',
  visited_at: props.initialData?.visited_at || today(),
});

const errors = reactive<{ name?: string; visited_at?: string }>({});

function validate(): boolean {
  errors.name = undefined;
  errors.visited_at = undefined;
  if (!form.name.trim()) errors.name = '请输入菜品名';
  if (!form.visited_at) errors.visited_at = '请选择日期';
  return !errors.name && !errors.visited_at;
}

function onSubmit() {
  if (!validate()) return;
  emit('submit', {
    ...form,
    name: form.name.trim(),
    restaurant: form.restaurant.trim() || undefined,
    cuisine_tag: form.cuisine_tag || undefined,
    address: form.address.trim() || undefined,
    rating: form.rating || undefined,
    price: form.price || undefined,
    note: form.note.trim() || undefined,
  });
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <!-- Name (required) -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        菜品名 <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.name"
        type="text"
        placeholder="例如：麻婆豆腐"
        class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        :class="
          errors.name
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'focus:border-primary-500 focus:ring-primary-500 border-[var(--color-border)]'
        "
        style="background-color: var(--color-surface); color: var(--color-text)"
      />
      <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
    </div>

    <!-- Restaurant + Cuisine -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">餐厅</label>
        <input
          v-model="form.restaurant"
          type="text"
          placeholder="餐厅名"
          class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-1 focus:outline-none"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">菜系</label>
        <DictSelect
          v-model="form.cuisine_tag"
          category="cuisine_tag"
          placeholder="选择菜系"
          clearable
        />
      </div>
    </div>

    <!-- Address -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">地址</label>
      <input
        v-model="form.address"
        type="text"
        placeholder="餐厅地址"
        class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        style="background-color: var(--color-surface); color: var(--color-text)"
      />
    </div>

    <!-- Rating + Price + Date -->
    <div class="grid grid-cols-3 gap-4">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">评分</label>
        <RatingStars v-model="form.rating" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">人均</label>
        <div class="relative">
          <span
            class="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-[var(--color-text-secondary)]"
            >¥</span
          >
          <input
            v-model.number="form.price"
            type="number"
            step="0.01"
            placeholder="0"
            class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-[var(--color-border)] py-2 pr-3 pl-7 text-sm focus:ring-1 focus:outline-none"
            style="background-color: var(--color-surface); color: var(--color-text)"
          />
        </div>
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
          日期 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.visited_at"
          type="date"
          class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
          :class="
            errors.visited_at
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'focus:border-primary-500 focus:ring-primary-500 border-[var(--color-border)]'
          "
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
        <p v-if="errors.visited_at" class="mt-1 text-xs text-red-500">{{ errors.visited_at }}</p>
      </div>
    </div>

    <!-- Photos -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">照片</label>
      <PhotoUpload v-model="form.photo_paths" module="foods" :max-files="9" />
    </div>

    <!-- Note -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">备注</label>
      <textarea
        v-model="form.note"
        rows="3"
        placeholder="味道如何？有什么特别的..."
        class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        style="background-color: var(--color-surface); color: var(--color-text)"
      />
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        class="rounded-lg border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)]"
        @click="$emit('cancel')"
      >
        取消
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="bg-primary-600 hover:bg-primary-700 rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
      >
        {{ loading ? '保存中...' : '保存' }}
      </button>
    </div>
  </form>
</template>
