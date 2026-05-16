<script setup lang="ts">
import { Search } from 'lucide-vue-next';

const { query, results, loading, fetched, search } = useSearch('books');
const api = useApi();
const { proxyUrl } = useImageProxy();
const loadingDetail = ref<string | null>(null);

const emit = defineEmits<{
  select: [item: any];
}>();

async function onSelect(item: any) {
  const doubanId = item.source_id?.startsWith('douban:')
    ? item.source_id.replace('douban:', '')
    : null;
  if (item.source === 'openlibrary' || !doubanId) {
    emitSelect(item);
    return;
  }

  loadingDetail.value = item.source_id;
  try {
    const res = await api.get('/api/search/book-detail', {
      id: doubanId,
      source_id: item.source_id,
    });
    if (res.success && res.data) {
      const d = res.data;
      emit('select', {
        title: item.title,
        author: d.author
          ? d.author.join('、')
          : Array.isArray(item.author)
            ? item.author.join('、')
            : undefined,
        isbn: d.isbn || item.isbn || undefined,
        rating: d.rating || item.rating || undefined,
        publisher: d.publisher || undefined,
        publish_year: d.year || item.year || undefined,
        page_count: d.page_count || undefined,
        price: d.price || undefined,
        series: d.series || undefined,
        original_title: d.original_title || undefined,
        summary: d.summary || '',
        cover_path: item.cover || undefined,
        source_id: item.source_id,
        source_url: item.source_url,
        review: '',
      });
      return;
    }
  } catch {
    // fall through
  } finally {
    loadingDetail.value = null;
  }

  emitSelect(item);
}

function emitSelect(item: any) {
  emit('select', {
    title: item.title,
    author: Array.isArray(item.author) ? item.author.join('、') : item.author || undefined,
    isbn: item.isbn || undefined,
    rating: item.rating || undefined,
    cover_path: item.cover || undefined,
    source_id: item.source_id,
    source_url: item.source_url,
    review: '',
  });
}

function onSubmit() {
  if (query.value.trim().length >= 2) search();
}
</script>

<template>
  <div>
    <form class="flex gap-2" @submit.prevent="onSubmit">
      <input
        v-model="query"
        type="text"
        placeholder="搜索书籍..."
        class="focus:border-primary-400 min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
      />
      <button
        type="submit"
        class="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
        :disabled="loading || query.trim().length < 2"
      >
        <Search class="h-4 w-4" />
        搜索
      </button>
    </form>

    <div v-if="loading" class="mt-3 text-center text-sm text-[var(--color-text-secondary)]">
      搜索中...
    </div>

    <div
      v-else-if="fetched && results.length === 0"
      class="mt-3 text-center text-sm text-[var(--color-text-secondary)]"
    >
      没有找到匹配的结果
    </div>

    <div v-if="results.length > 0" class="mt-3 space-y-2">
      <button
        v-for="item in results"
        :key="item.source_id"
        type="button"
        :disabled="loadingDetail !== null"
        class="hover:border-primary-400 flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] p-2 text-left transition-colors hover:bg-[var(--color-bg)] disabled:opacity-50"
        @click="onSelect(item)"
      >
        <img
          v-if="item.cover"
          :src="proxyUrl(item.cover)"
          class="h-16 w-12 shrink-0 rounded object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex h-16 w-12 shrink-0 items-center justify-center rounded bg-[var(--color-bg)] text-xl"
        >
          📖
        </div>
        <div class="min-w-0 flex-1">
          <p class="line-clamp-1 font-medium text-[var(--color-text)]">{{ item.title }}</p>
          <p
            v-if="Array.isArray(item.author) && item.author.length > 0"
            class="text-xs text-[var(--color-text-secondary)]"
          >
            {{ item.author.join('、') }}
          </p>
          <div class="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span v-if="item.year" class="text-xs text-[var(--color-text-secondary)]">{{
              item.year
            }}</span>
          </div>
          <span v-if="loadingDetail === item.source_id" class="text-primary-600 mt-1 text-xs">
            正在获取详情...
          </span>
        </div>
      </button>
    </div>

    <p v-if="results.length > 0" class="mt-2 text-xs text-[var(--color-text-secondary)]">
      搜索结果由豆瓣提供
    </p>
  </div>
</template>
