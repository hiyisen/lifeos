import { searchDoubanBooks, doubanImageUrl } from '../../services/douban';
import { searchOpenLibrary, olCoverUrl } from '../../services/openlibrary';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const q = String(query.q || '').trim();
  if (q.length < 2) return { success: true, data: [] };

  // Try Douban first
  try {
    const doubanResults = await searchDoubanBooks(q);
    if (doubanResults.length > 0) {
      return {
        success: true,
        data: doubanResults.map((item) => ({
          source: 'douban',
          title: item.title,
          author: item.author,
          year: item.year,
          cover: doubanImageUrl(item.img),
          source_id: `douban:${item.id}`,
          source_url: item.url || `https://book.douban.com/subject/${item.id}/`,
        })),
      };
    }
  } catch {
    // Fall through to OpenLibrary
  }

  // Fallback to OpenLibrary
  try {
    const olResults = await searchOpenLibrary(q);
    return {
      success: true,
      data: olResults.map((item) => ({
        source: 'openlibrary',
        title: item.title,
        author: item.author_name || [],
        year: item.first_publish_year,
        cover: olCoverUrl(item.cover_i, 'M'),
        isbn: item.isbn?.[0],
        source_id: `ol:${item.key}`,
        source_url: `https://openlibrary.org${item.key}`,
      })),
    };
  } catch {
    return { success: true, data: [] };
  }
});
