<script setup lang="ts">
import { ChevronDown, Plus } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    category: string;
    modelValue: string;
    placeholder?: string;
    clearable?: boolean;
    allowCustom?: boolean;
  }>(),
  {
    placeholder: '请选择...',
    clearable: false,
    allowCustom: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const { getItems, load, loaded } = useDict();

const open = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const customLabel = ref('');

const items = computed(() => getItems(props.category));
const selectedLabel = computed(() => {
  const item = items.value.find((i) => i.code === props.modelValue);
  return (item?.label ?? props.modelValue) || props.placeholder;
});

function select(code: string) {
  emit('update:modelValue', code);
  open.value = false;
}

function addCustom() {
  const code = customLabel.value.trim();
  if (!code) return;
  emit('update:modelValue', code);
  customLabel.value = '';
  open.value = false;
}

onClickOutside(dropdownRef, () => {
  open.value = false;
});

if (!loaded.value) load();
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      type="button"
      class="hover:border-primary-400 focus:border-primary-500 focus:ring-primary-500 flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] transition-colors focus:ring-1 focus:outline-none"
      @click="open = !open"
    >
      <span :class="{ 'text-[var(--color-text-secondary)]': !modelValue }">
        {{ selectedLabel }}
      </span>
      <ChevronDown
        class="h-4 w-4 text-[var(--color-text-secondary)] transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute z-40 mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
      >
        <button
          v-if="clearable && modelValue"
          class="w-full px-3 py-1.5 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
          @click="emit('update:modelValue', '')"
        >
          清除选择
        </button>
        <button
          v-for="item in items"
          :key="item.code"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-bg)]"
          :class="
            modelValue === item.code
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-[var(--color-text)]'
          "
          @click="select(item.code)"
        >
          <span
            v-if="item.color"
            class="h-2.5 w-2.5 rounded-full"
            :style="{ backgroundColor: item.color }"
          />
          {{ item.label }}
        </button>

        <!-- Custom entry -->
        <div v-if="allowCustom" class="border-t border-[var(--color-border)] px-2 py-1.5">
          <div class="flex items-center gap-1">
            <input
              v-model="customLabel"
              type="text"
              class="focus:border-primary-400 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
              placeholder="自定义..."
              @keydown.enter="addCustom"
            />
            <button
              type="button"
              class="text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950 rounded-md p-1"
              @click="addCustom"
            >
              <Plus class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
