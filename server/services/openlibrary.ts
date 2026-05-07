import { checkSearchCache, cacheSearchResult } from '../utils/cache';

const OL_BASE = 'https://openlibrary.org';

export interface OLResult {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
}

export async function searchOpenLibrary(query: string): Promise<OLResult[]> {
  const cached = checkSearchCache('openlibrary', query);
  if (cached) return JSON.parse(cached);

  const data = await $fetch<{
    docs: OLResult[];
    numFound: number;
  }>(`${OL_BASE}/search.json`, {
    params: { q: query, limit: 10 },
  });

  const results = data.docs || [];
  cacheSearchResult('openlibrary', query, results);
  return results;
}

export function olCoverUrl(coverI: number | undefined, size: 'S' | 'M' | 'L' = 'M'): string | null {
  if (!coverI) return null;
  return `https://covers.openlibrary.org/b/id/${coverI}-${size}.jpg`;
}
