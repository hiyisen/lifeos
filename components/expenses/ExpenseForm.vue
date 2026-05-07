<script setup lang="ts">
const props = withDefaults(
  defineProps<{ initialData?: Record<string, any>; loading?: boolean; quickMode?: boolean }>(),
  { loading: false, quickMode: false },
);
const emit = defineEmits<{ submit: [data: Record<string, any>]; cancel: [] }>();

const today = new Date().toISOString().split('T')[0];
const form = reactive({
  amount: props.initialData?.amount || (undefined as number | undefined),
  category: props.initialData?.category || 'food',
  type: props.initialData?.type || 'expense',
  payment_method: props.initialData?.payment_method || '',
  note: props.initialData?.note || '',
  record_date: props.initialData?.record_date || today,
});

const errors = reactive<{ amount?: string; category?: string }>({});

function validate() {
  errors.amount = undefined;
  errors.category = undefined;
  if (!form.amount || form.amount <= 0) errors.amount = '请输入金额';
  if (!form.category) errors.category = '请选择分类';
  return !errors.amount && !errors.category;
}

function onSubmit() {
  if (!validate()) return;
  emit('submit', {
    amount: form.amount,
    category: form.category,
    type: form.type,
    payment_method: form.payment_method || undefined,
    note: form.note.trim() || undefined,
    record_date: form.record_date,
  });
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <!-- Amount (big input for quick mode) -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
        >金额 <span class="text-red-500">*</span></label
      >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
          :class="
            form.type === 'expense'
              ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
          "
          @click="form.type = 'expense'"
        >
          支出
        </button>
        <button
          type="button"
          class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
          :class="
            form.type === 'income'
              ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
          "
          @click="form.type = 'income'"
        >
          收入
        </button>
        <div class="relative flex-1">
          <span
            class="absolute top-1/2 left-3 -translate-y-1/2 text-lg text-[var(--color-text-secondary)]"
            >¥</span
          >
          <input
            v-model.number="form.amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            class="w-full rounded-lg border py-2 pr-3 pl-8 text-lg font-bold focus:outline-none"
            :class="
              errors.amount
                ? 'border-red-500'
                : 'focus:border-primary-500 border-[var(--color-border)]'
            "
            style="background-color: var(--color-surface); color: var(--color-text)"
            autofocus
          />
        </div>
      </div>
      <p v-if="errors.amount" class="mt-1 text-xs text-red-500">{{ errors.amount }}</p>
    </div>

    <div class="grid gap-4" :class="quickMode ? 'grid-cols-1' : 'grid-cols-2'">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">分类</label
        ><DictSelect v-model="form.category" category="expense_category" placeholder="选择分类" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">日期</label
        ><input
          v-model="form.record_date"
          type="date"
          class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
    </div>

    <template v-if="!quickMode">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">支付方式</label>
        <DictSelect
          v-model="form.payment_method"
          category="payment_method"
          placeholder="选择支付方式"
          clearable
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">备注</label
        ><input
          v-model="form.note"
          type="text"
          placeholder="备注..."
          class="focus:border-primary-500 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none"
          style="background-color: var(--color-surface); color: var(--color-text)"
        />
      </div>
    </template>

    <div class="flex justify-end gap-3 pt-2">
      <button
        v-if="!quickMode"
        type="button"
        class="rounded-lg border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        @click="$emit('cancel')"
      >
        取消
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
        :class="
          form.type === 'expense'
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700'
        "
      >
        {{ loading ? '保存中...' : form.type === 'expense' ? '记支出' : '记收入' }}
      </button>
    </div>
  </form>
</template>
