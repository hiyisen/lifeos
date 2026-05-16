/**
 * OpenLibrary API服务模块
 * 提供开放图书馆（OpenLibrary.org）的书籍搜索功能
 * OpenLibrary是一个开放的图书目录数据库，包含数百万本书籍信息
 */

import { checkSearchCache, cacheSearchResult } from '../utils/cache';

// OpenLibrary API基础URL
const OL_BASE = 'https://openlibrary.org';

/**
 * OpenLibrary搜索结果数据结构
 */
export interface OLResult {
  key: string; // 书籍唯一标识（如/works/OL12345W）
  title: string; // 书名
  author_name?: string[]; // 作者姓名列表
  first_publish_year?: number; // 首次出版年份
  cover_i?: number; // 封面图片ID
  isbn?: string[]; // ISBN列表
}

/**
 * 搜索OpenLibrary书籍
 * 支持缓存，避免重复请求
 * @param query 搜索关键词
 * @returns 书籍搜索结果数组
 */
export async function searchOpenLibrary(query: string): Promise<OLResult[]> {
  const cached = checkSearchCache('openlibrary', query);
  if (cached) return JSON.parse(cached);

  // 调用OpenLibrary搜索API，限制返回10条结果
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

/**
 * 生成OpenLibrary封面图片URL
 * 支持不同尺寸（小S、中M、大L）
 * @param coverI 封面图片ID
 * @param size 图片尺寸
 * @returns 封面图片URL或null
 */
export function olCoverUrl(coverI: number | undefined, size: 'S' | 'M' | 'L' = 'M'): string | null {
  if (!coverI) return null;
  return `https://covers.openlibrary.org/b/id/${coverI}-${size}.jpg`;
}
