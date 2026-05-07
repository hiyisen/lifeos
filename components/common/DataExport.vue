<script setup lang="ts">
import { Download, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-vue-next';

const props = defineProps<{
  module?: string;
}>();

const loading = ref(false);
const open = ref(false);

async function exportData(format: 'json' | 'csv') {
  loading.value = true;
  open.value = false;
  try {
    const mod = props.module || 'all';
    const url = `/api/export/${mod}?format=${format}`;
    if (format === 'json') {
      const res = await $fetch<{ success: boolean; data: unknown }>(url);
      if (res.success) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${mod}-export.json`);
      }
    } else {
      const blob = await $fetch<Blob>(url, { responseType: 'blob' });
      downloadBlob(blob as Blob, `${mod}-export.csv`);
    }
  } catch {
    // handle error
  } finally {
    loading.value = false;
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function handleClickOutside() {
  open.value = false;
}
</script>

<template>
  <div class="relative">
    <button
      class="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)]"
      @click.stop="open = !open"
    >
      <Download class="h-4 w-4" />
      导出
      <ChevronDown class="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-50 mt-2 w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
    >
      <button
        class="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        :disabled="loading"
        @click="exportData('json')"
      >
        <FileJson class="h-4 w-4 text-blue-500" />
        JSON 格式
      </button>
      <button
        class="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        :disabled="loading"
        @click="exportData('csv')"
      >
        <FileSpreadsheet class="h-4 w-4 text-green-500" />
        CSV 格式
      </button>
    </div>

    <!-- Backdrop for click outside -->
    <div v-if="open" class="fixed inset-0 z-40" @click="handleClickOutside" />
  </div>
</template>
