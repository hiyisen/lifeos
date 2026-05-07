<script setup lang="ts">
import { Pencil, Trash2, Calendar } from 'lucide-vue-next';

const props = defineProps<{
  expense: {
    id: number;
    amount: number;
    category: string;
    type: string;
    payment_method?: string | null;
    note?: string | null;
    record_date: string;
    created_at?: string;
  };
}>();

defineEmits<{
  edit: [id: number];
  delete: [id: number];
}>();

const { getLabel, loaded, load } = useDict();
if (!loaded.value) load();

const categoryLabel = computed(() => getLabel('expense_category', props.expense.category));
const paymentLabel = computed(() =>
  props.expense.payment_method ? getLabel('payment_method', props.expense.payment_method) : '',
);

const showDeleteConfirm = ref(false);
</script>

<template>
  <div class="mx-auto max-w-xl">
    <!-- Amount hero -->
    <div class="mb-6 text-center">
      <p
        class="text-5xl font-bold"
        :class="
          expense.type === 'income'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        "
      >
        {{ expense.type === 'income' ? '+' : '-' }}¥{{ Math.abs(expense.amount).toFixed(2) }}
      </p>
      <p class="mt-2 text-sm text-[var(--color-text-secondary)]">
        {{ expense.type === 'income' ? '收入' : '支出' }}
      </p>
    </div>

    <!-- Info -->
    <div
      class="mb-6 space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm text-[var(--color-text-secondary)]">分类</span>
        <StatusBadge :label="categoryLabel" />
      </div>
      <div v-if="paymentLabel" class="flex items-center justify-between">
        <span class="text-sm text-[var(--color-text-secondary)]">支付方式</span>
        <span class="text-sm font-medium text-[var(--color-text)]">{{ paymentLabel }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-[var(--color-text-secondary)]">日期</span>
        <span class="inline-flex items-center gap-1 text-sm text-[var(--color-text)]">
          <Calendar class="h-3.5 w-3.5" />
          {{ expense.record_date }}
        </span>
      </div>
    </div>

    <!-- Note -->
    <div
      v-if="expense.note"
      class="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <p class="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-secondary)]">
        {{ expense.note }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 border-t border-[var(--color-border)] pt-6">
      <button
        class="bg-primary-600 hover:bg-primary-700 inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
        @click="$emit('edit', expense.id)"
      >
        <Pencil class="h-4 w-4" />
        编辑
      </button>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
        @click="showDeleteConfirm = true"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>

    <ConfirmDialog
      :open="showDeleteConfirm"
      title="删除记账记录"
      :message="`确定要删除这条${expense.type === 'income' ? '收入' : '支出'}记录吗？此操作不可撤销。`"
      confirm-text="删除"
      variant="danger"
      @confirm="
        $emit('delete', expense.id);
        showDeleteConfirm = false;
      "
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
