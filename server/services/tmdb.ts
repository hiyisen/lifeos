/**
 * TMDB (The Movie Database) API服务模块
 * 提供电影和电视剧的搜索、详情获取功能
 * 需要配置TMDB_API_KEY环境变量才能使用
 */

import { checkSearchCache, cacheSearchResult } from '../utils/cache';

// TMDB API基础URL
const TMDB_BASE = 'https://api.themoviedb.org/3';

/**
 * TMDB搜索结果数据结构
 */
export interface TMDBResult {
  id: number; // TMDB ID
  title?: string; // 电影标题
  name?: string; // 电视剧名称
  release_date?: string; // 电影上映日期
  first_air_date?: string; // 电视剧首播日期
  poster_path: string | null; // 海报图片路径
  overview: string; // 简介
  media_type: 'movie' | 'tv'; // 媒体类型
  vote_average: number; // 评分（0-10）
}

/**
 * 搜索TMDB媒体内容
 * 支持电影和电视剧的混合搜索
 * @param query 搜索关键词
 * @returns 媒体搜索结果数组
 */
export async function searchTMDB(query: string): Promise<TMDBResult[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  const cached = checkSearchCache('tmdb', query);
  if (cached) return JSON.parse(cached);

  // 调用TMDB多类型搜索API
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

  // 过滤只保留电影和电视剧类型，并限制返回10条结果
  const filtered = searchResults.results
    .filter((r): r is TMDBResult => r.media_type === 'movie' || r.media_type === 'tv')
    .slice(0, 10);

  cacheSearchResult('tmdb', query, filtered);
  return filtered;
}

/**
 * TMDB媒体详情数据结构
 */
export interface TMDBMediaDetail {
  rating?: number; // 评分
  summary?: string; // 简介
  year?: number; // 年份
  genres: string[]; // 类型/标签
  directors: string[]; // 导演
  actors: string[]; // 演员（前5位）
  runtime?: number; // 片长（分钟）
  release_date?: string; // 上映日期
  imdb_id?: string; // IMDB ID
  original_title?: string; // 原名
}

/**
 * 获取TMDB媒体详情
 * 通过标题搜索并获取详细信息，包括演职人员
 * @param title 媒体标题
 * @param year 年份（可选，用于精确匹配）
 * @returns 媒体详情或null（获取失败时）
 */
export async function fetchTMDBMediaDetail(
  title: string,
  year?: number,
): Promise<TMDBMediaDetail | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  const cached = checkSearchCache('tmdb-media-detail', `${title}-${year || ''}`);
  if (cached) return JSON.parse(cached);

  try {
    // 先搜索匹配的媒体
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

    // 找到第一个有效的电影或电视剧结果
    const match = searchResults.results.find(
      (r) => r.media_type === 'movie' || r.media_type === 'tv',
    );
    if (!match) return null;

    const mediaType = match.media_type;
    const tmdbId = match.id;

    // 并行获取详情和演职人员信息
    const [detail, credits] = await Promise.all([
      $fetch<Record<string, any>>(`${TMDB_BASE}/${mediaType}/${tmdbId}`, {
        params: { api_key: apiKey, language: 'zh-CN' },
      }),
      $fetch<Record<string, any>>(`${TMDB_BASE}/${mediaType}/${tmdbId}/credits`, {
        params: { api_key: apiKey },
      }),
    ]);

    // 提取导演信息
    const directors: string[] = [];
    const actors: string[] = [];

    if (credits.crew) {
      for (const c of credits.crew) {
        if (c.job === 'Director') directors.push(c.name);
      }
    }
    // 提取前5位演员
    if (credits.cast) {
      for (const c of credits.cast.slice(0, 5)) {
        actors.push(c.name);
      }
    }

    // 提取类型信息
    const genres: string[] = detail.genres?.map((g: any) => g.name).filter(Boolean) || [];

    // 构建完整的媒体详情对象
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

/**
 * 生成TMDB图片URL
 * TMDB使用不同的尺寸标识符
 * @param path 图片路径
 * @param size 图片尺寸（w185=小图, w342=中图, w500=大图）
 * @returns 完整的图片URL或null
 */
export function tmdbImageUrl(
  path: string | null,
  size: 'w185' | 'w342' | 'w500' = 'w500',
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
