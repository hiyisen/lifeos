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

export interface TMDBMediaDetail {
  rating?: number;
  summary?: string;
  year?: number;
  genres: string[];
  directors: string[];
  actors: string[];
  runtime?: number;
  release_date?: string;
  imdb_id?: string;
  original_title?: string;
}

export async function fetchTMDBMediaDetail(
  title: string,
  year?: number,
): Promise<TMDBMediaDetail | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  const cached = checkSearchCache('tmdb-media-detail', `${title}-${year || ''}`);
  if (cached) return JSON.parse(cached);

  try {
    const searchResults = await $fetch<{
      results: Array<{
        id: number;
        title?: string;
        name?: string;
        media_type: string;
        release_date?: string;
        first_air_date?: string;
        vote_average: number;
        overview: string;
      }>;
    }>(`${TMDB_BASE}/search/multi`, {
      params: { api_key: apiKey, query: title, language: 'zh-CN', page: 1 },
    });

    if (!searchResults?.results?.length) return null;

    const match = searchResults.results.find(
      (r) => r.media_type === 'movie' || r.media_type === 'tv',
    );
    if (!match) return null;

    const mediaType = match.media_type;
    const tmdbId = match.id;

    const [detail, credits] = await Promise.all([
      $fetch<Record<string, any>>(`${TMDB_BASE}/${mediaType}/${tmdbId}`, {
        params: { api_key: apiKey, language: 'zh-CN' },
      }),
      $fetch<Record<string, any>>(`${TMDB_BASE}/${mediaType}/${tmdbId}/credits`, {
        params: { api_key: apiKey },
      }),
    ]);

    const directors: string[] = [];
    const actors: string[] = [];

    if (credits.crew) {
      for (const c of credits.crew) {
        if (c.job === 'Director') directors.push(c.name);
      }
    }
    if (credits.cast) {
      for (const c of credits.cast.slice(0, 5)) {
        actors.push(c.name);
      }
    }

    const genres: string[] = detail.genres?.map((g: any) => g.name).filter(Boolean) || [];

    const result: TMDBMediaDetail = {
      rating: match.vote_average ? Number(match.vote_average) : undefined,
      summary: match.overview || detail.overview || undefined,
      year: match.release_date
        ? Number(match.release_date.slice(0, 4))
        : match.first_air_date
          ? Number(match.first_air_date.slice(0, 4))
          : undefined,
      genres,
      directors,
      actors,
      runtime: detail.runtime ? Number(detail.runtime) : undefined,
      release_date: detail.release_date || match.release_date || undefined,
      imdb_id: detail.imdb_id || undefined,
      original_title: detail.original_title || match.title || undefined,
    };

    cacheSearchResult('tmdb-media-detail', `${title}-${year || ''}`, result);
    return result;
  } catch {
    return null;
  }
}

export function tmdbImageUrl(
  path: string | null,
  size: 'w185' | 'w342' | 'w500' = 'w500',
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
