import { checkSearchCache, cacheSearchResult } from '../utils/cache';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  overview: string;
  media_type: 'movie' | 'tv';
  vote_average: number;
}

export async function searchTMDB(query: string): Promise<TMDBResult[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  const cached = checkSearchCache('tmdb', query);
  if (cached) return JSON.parse(cached);

  const searchResults = await $fetch<{
    page: number;
    results: Array<{
      id: number;
      title?: string;
      name?: string;
      release_date?: string;
      first_air_date?: string;
      poster_path: string | null;
      overview: string;
      media_type: string;
      vote_average: number;
    }>;
    total_pages: number;
    total_results: number;
  }>(`${TMDB_BASE}/search/multi`, {
    params: {
      api_key: apiKey,
      query,
      language: 'zh-CN',
      page: 1,
    },
  });

  if (!searchResults || !searchResults.results) return [];

  const filtered = searchResults.results
    .filter((r): r is TMDBResult => r.media_type === 'movie' || r.media_type === 'tv')
    .slice(0, 10);

  cacheSearchResult('tmdb', query, filtered);
  return filtered;
}

export function tmdbImageUrl(
  path: string | null,
  size: 'w185' | 'w342' | 'w500' = 'w500',
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
