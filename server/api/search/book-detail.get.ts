import { fetchDoubanBookDetail } from '../../services/douban';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = String(query.id || '').trim();
  if (!id) return { success: false, error: 'Missing id' };

  try {
    const detail = await fetchDoubanBookDetail(id);
    if (detail && (detail.rating || detail.summary || detail.author?.length)) {
      return { success: true, data: detail };
    }

    // Fallback to OpenLibrary if source_id is provided
    const sourceId = String(query.source_id || '');
    if (sourceId.startsWith('ol:')) {
      try {
        const olKey = sourceId.replace('ol:', '');
        const olData = await $fetch<Record<string, any>>(`https://openlibrary.org${olKey}.json`);
        if (olData) {
          return {
            success: true,
            data: {
              rating: undefined,
              summary:
                (olData.description as string)?.split('---')[0]?.trim()?.slice(0, 500) || undefined,
              author: olData.authors
                ? await Promise.all(
                    olData.authors.slice(0, 3).map(async (a: any) => {
                      try {
                        const authorKey = a.author?.key || a.key;
                        if (authorKey) {
                          const authorData = await $fetch<{ name?: string }>(
                            `https://openlibrary.org${authorKey}.json`,
                          );
                          return authorData.name || '';
                        }
                      } catch {
                        // skip
                      }
                      return '';
                    }),
                  ).then((names) => names.filter(Boolean))
                : undefined,
              publisher: olData.publishers?.[0] || undefined,
              year: olData.first_publish_date
                ? Number(String(olData.first_publish_date).match(/\d{4}/)?.[0])
                : undefined,
              isbn: olData.isbn_10?.[0] || olData.isbn_13?.[0] || undefined,
              page_count: olData.number_of_pages || undefined,
              price: undefined,
              series: undefined,
            },
          };
        }
      } catch {
        // fall through
      }
    }

    if (detail) return { success: true, data: detail };
    return { success: false, error: 'Failed to fetch detail' };
  } catch {
    return { success: false, error: 'Network error' };
  }
});
