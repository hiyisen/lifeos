import { searchDoubanMedia, doubanImageUrl } from '../../services/douban';
import { searchTMDB, tmdbImageUrl } from '../../services/tmdb';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const q = String(query.q || '').trim();
  if (q.length < 2) return { success: true, data: [] };

  // Try Douban first
  try {
    const doubanResults = await searchDoubanMedia(q);
    if (doubanResults.length > 0) {
      return {
        success: true,
        data: doubanResults.map((item) => ({
          source: 'douban',
          title: item.title,
          original_title: item.original_title,
          year: item.year,
          type: item.type || 'movie',
          poster: doubanImageUrl(item.img),
          source_id: `douban:${item.id}`,
          source_url: item.url || `https://movie.douban.com/subject/${item.id}/`,
        })),
      };
    }
  } catch {
    // Fall through to TMDB
  }

  // Fallback to TMDB
  try {
    const tmdbResults = await searchTMDB(q);
    return {
      success: true,
      data: tmdbResults.map((item) => ({
        source: 'tmdb',
        title: item.title || item.name || '未知',
        year: item.release_date
          ? new Date(item.release_date).getFullYear()
          : item.first_air_date
            ? new Date(item.first_air_date).getFullYear()
            : undefined,
        type: item.media_type === 'movie' ? 'movie' : 'tv',
        rating: item.vote_average ? Math.round(item.vote_average / 2) : undefined,
        poster: tmdbImageUrl(item.poster_path, 'w185'),
        director: '',
        summary: item.overview || '',
        source_id: `tmdb:${item.id}`,
        source_url: `https://www.themoviedb.org/${item.media_type}/${item.id}`,
      })),
    };
  } catch {
    return { success: true, data: [] };
  }
});
