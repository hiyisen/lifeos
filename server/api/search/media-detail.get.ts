import { fetchDoubanMediaDetail } from '../../services/douban';
import { fetchTMDBMediaDetail } from '../../services/tmdb';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = String(query.id || '').trim();
  if (!id) return { success: false, error: 'Missing id' };

  try {
    const detail = await fetchDoubanMediaDetail(id);
    if (detail && (detail.rating || detail.summary || detail.year || detail.genres.length > 0)) {
      return { success: true, data: detail };
    }

    // Douban blocked — fall back to TMDB
    const title = String(query.title || '').trim();
    if (title) {
      const tmdbDetail = await fetchTMDBMediaDetail(title, Number(query.year) || undefined);
      if (tmdbDetail) return { success: true, data: tmdbDetail };
    }

    if (detail) return { success: true, data: detail };
    return { success: false, error: 'Failed to fetch detail' };
  } catch {
    return { success: false, error: 'Network error' };
  }
});
