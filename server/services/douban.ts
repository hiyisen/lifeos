/**
 * 豆瓣API服务模块
 * 提供豆瓣电影和图书的搜索、详情获取功能
 * 包含防反爬虫机制、请求限流和结果缓存
 */

import * as cheerio from 'cheerio';
import { checkSearchCache, cacheSearchResult } from '../utils/cache';

// 豆瓣API端点
const DOUBAN_MOVIE_SUGGEST = 'https://movie.douban.com/j/subject_suggest';
const DOUBAN_BOOK_SUGGEST = 'https://book.douban.com/j/subject_suggest';

// ---- 请求限流器 ----

// 记录上次请求时间，用于实现请求间隔控制
let lastRequestTime = 0;
// 最小请求间隔（毫秒），防止被豆瓣封禁
const MIN_INTERVAL = 1500;

/**
 * 生成会话bid（豆瓣的会话标识）
 * 每次请求都会生成新的bid以模拟真实用户行为
 * @returns 随机生成的11位字符串bid
 */
function generateBid(): string {
  return Array.from(
    { length: 11 },
    () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)],
  ).join('');
}

// 全局会话bid，每次请求后更新
let sessionBid = generateBid();

// 基础请求头，模拟真实浏览器
const BASE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

/**
 * 等待请求限流
 * 确保两次请求之间有足够的时间间隔，并更新会话bid
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL) {
    // 添加随机抖动避免固定间隔被识别
    const jitter = Math.random() * 1000;
    await new Promise((r) => setTimeout(r, MIN_INTERVAL - elapsed + jitter));
  }
  lastRequestTime = Date.now();
  sessionBid = generateBid();
}

/**
 * 执行豆瓣请求（带防反爬虫处理）
 * @param url 请求URL
 * @param useMobileUA 是否使用移动设备User-Agent
 * @returns 响应HTML文本
 */
async function doubanFetch(url: string, useMobileUA = false): Promise<string> {
  await waitForRateLimit();
  const response = await fetch(url, {
    headers: {
      'User-Agent': useMobileUA
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Cookie: `bid=${sessionBid}`,
    },
  });
  return response.text();
}

/**
 * 执行带参数的豆瓣请求（带限流）
 * @param url 基础URL
 * @param params URL查询参数
 * @returns 响应HTML文本
 */
async function rateLimitedFetch(url: string, params: Record<string, string>): Promise<string> {
  await waitForRateLimit();
  const searchUrl = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    searchUrl.searchParams.set(k, v);
  }
  const response = await fetch(searchUrl.toString(), {
    headers: { ...BASE_HEADERS, Cookie: `bid=${sessionBid}` },
  });
  return response.text();
}

/**
 * 检测是否被豆瓣反爬虫机制拦截
 * 豆瓣会返回包含SHA-512工作量证明的JS挑战页面
 * @param html 响应HTML内容
 * @returns 是否被拦截
 */
function isBlocked(html: string): boolean {
  // Detect Douban's JS challenge page — it has a specific form with SHA-512 proof-of-work
  return /function sha512/.test(html) && /name="sec"/.test(html) && /name="cha"/.test(html);
}

// ---- 媒体详情接口定义 ----

/**
 * 豆瓣媒体详情数据结构
 */
export interface DoubanMediaDetail {
  rating?: number; // 评分
  summary?: string; // 简介
  year?: number; // 年份
  genres: string[]; // 类型/标签
  country?: string; // 国家/地区
  language?: string; // 语言
  runtime?: number; // 片长（分钟）
  release_date?: string; // 上映日期
  original_title?: string; // 原名
  directors: string[]; // 导演
  actors: string[]; // 演员
  imdb_id?: string; // IMDB ID
}

/**
 * 从豆瓣摘要API获取媒体详情
 * 使用 /j/subject_abstract 接口，返回完整的导演、演员、类型等数据
 * @param id 豆瓣媒体ID
 * @returns 媒体详情或null（获取失败时）
 */
async function fetchDoubanMediaAbstract(id: string): Promise<DoubanMediaDetail | null> {
  const cached = checkSearchCache('douban-media-abstract', id);
  if (cached) return JSON.parse(cached);

  try {
    await waitForRateLimit();
    const url = `https://movie.douban.com/j/subject_abstract?subject_id=${id}`;
    const response = await fetch(url, {
      headers: { ...BASE_HEADERS, Cookie: `bid=${sessionBid}` },
    });

    const json = (await response.json()) as { r: unknown; subject?: Record<string, unknown> };
    if (json.r !== 0 || !json.subject) return null;

    const s = json.subject;

    // Parse duration: "142分钟" → 142
    let runtime: number | undefined;
    const durMatch = (s.duration as string)?.match(/(\d+)/);
    if (durMatch) runtime = Number(durMatch[1]);

    // Parse release_date from title year
    const release_year = s.release_year ? String(s.release_year) : undefined;

    // Parse original title from title field
    // Format: "Chinese Name English/Japanese Name (year)"
    let original_title: string | undefined;
    const titleStr = ((s.title as string) || '').replace(/[\u200b-\u200f\ufeff]/g, '');
    const titleNoYear = titleStr.replace(/\s*\(?\d{4}\)?\s*$/, '').trim();
    const origMatch = titleNoYear.match(/^[一-鿿\s]+(.+)/);
    if (origMatch && origMatch[1] && !/^[一-鿿]/.test(origMatch[1])) {
      original_title = origMatch[1].trim();
    }

    const detail: DoubanMediaDetail = {
      rating: s.rate ? Number(s.rate) : undefined,
      year: s.release_year ? Number(s.release_year) : undefined,
      genres: Array.isArray(s.types) ? (s.types as string[]) : [],
      country: (s.region as string) || undefined,
      runtime,
      release_date: release_year,
      original_title: original_title || undefined,
      directors: Array.isArray(s.directors) ? (s.directors as string[]) : [],
      actors: Array.isArray(s.actors) ? (s.actors as string[]) : [],
    };

    cacheSearchResult('douban-media-abstract', id, detail);
    return detail;
  } catch {
    return null;
  }
}

/**
 * 获取豆瓣媒体详情（摘要 + 移动端简介合并）
 * 优先使用 /j/subject_abstract JSON API 获取导演、演员、类型等结构化数据
 * 再通过移动端页面获取剧情简介
 * @param id 豆瓣媒体ID
 * @returns 媒体详情或null（获取失败时）
 */
export async function fetchDoubanMediaDetail(id: string): Promise<DoubanMediaDetail | null> {
  const cached = checkSearchCache('douban-media-detail', id);
  if (cached) return JSON.parse(cached);

  // Try abstract API first for structured data (directors, actors, genres, etc.)
  const abstract = await fetchDoubanMediaAbstract(id);

  // Try mobile page for summary and release_date (not in abstract API)
  let summary: string | undefined;
  let mobileReleaseDate: string | undefined;
  try {
    const html = await doubanFetch(`https://m.douban.com/movie/subject/${id}/`, true);
    if (!isBlocked(html)) {
      const $ = cheerio.load(html);
      summary =
        $('meta[itemprop="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        '';
      summary = summary.replace(/^.+?简介[：:]\s*/, '').trim() || undefined;

      // Extract full release date (YYYY-MM-DD) from body text
      const bodyText = $('body').text();
      const dateMatch = bodyText.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) mobileReleaseDate = dateMatch[1];
    }
  } catch {
    // Mobile page failed — proceed with abstract data only
  }

  if (abstract) {
    const detail: DoubanMediaDetail = {
      ...abstract,
      summary: summary || abstract.summary,
      release_date: mobileReleaseDate || abstract.release_date,
    };
    cacheSearchResult('douban-media-detail', id, detail);
    return detail;
  }

  // Abstract failed — try full mobile scrape as fallback
  try {
    const html = await doubanFetch(`https://m.douban.com/movie/subject/${id}/`, true);
    if (isBlocked(html)) return null;

    const $ = cheerio.load(html);
    const rating =
      $('meta[itemprop="ratingValue"]').attr('content') ||
      ($('meta[property="og:description"]').attr('content') || '').match(
        /豆瓣评分[：:]\s*([\d.]+)/,
      )?.[1];

    const rawSummary =
      $('meta[itemprop="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';
    const cleanSummary = rawSummary.replace(/^.+?简介[：:]\s*/, '').trim();

    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const yearMatch = metaDesc.match(/\((\d{4})\)/);
    const year = yearMatch ? Number(yearMatch[1]) : undefined;

    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const original_title = ogTitle.replace(/\s*-\s*电影.*$/, '').trim() || undefined;

    const bodyText = $('body').text();
    const infoMatch = bodyText.match(/([一-龥]+(?:\s*\/\s*[一-龥]+)*?)\s*\/\s*(\d{4}[^上]*上映)/);
    const genres: string[] = [];
    let country: string | undefined;
    let runtime: number | undefined;
    let release_date: string | undefined;

    if (infoMatch) {
      const parts = infoMatch[1].split('/').map((s: string) => s.trim());
      if (parts.length > 0) country = parts[0];
      genres.push(...parts.slice(1).filter((g: string) => g.length > 0));
      if (infoMatch[2]) {
        const rawDate = infoMatch[2].replace('上映', '').trim();
        const dateMatch = rawDate.match(/(\d{4}-\d{2}-\d{2})/);
        release_date = dateMatch ? dateMatch[1] : rawDate;
      }
    }

    const runtimeMatch = bodyText.match(/片长(\d+)分钟/);
    if (runtimeMatch) runtime = Number(runtimeMatch[1]);

    const detail: DoubanMediaDetail = {
      rating: rating ? Number(rating) : undefined,
      summary: summary || cleanSummary || undefined,
      year,
      genres,
      country,
      runtime,
      release_date,
      original_title: original_title || undefined,
      directors: [],
      actors: [],
    };

    cacheSearchResult('douban-media-detail', id, detail);
    return detail;
  } catch {
    return null;
  }
}

// ---- 图书详情接口定义 ----

/**
 * 豆瓣图书详情数据结构
 */
export interface DoubanBookDetail {
  rating?: number; // 评分
  summary?: string; // 简介
  author?: string[]; // 作者
  publisher?: string; // 出版社
  year?: number; // 出版年份
  isbn?: string; // ISBN
  page_count?: number; // 页数
  price?: string; // 定价
  series?: string; // 丛书
}

/**
 * 获取豆瓣图书详情
 * 支持缓存，避免重复请求
 * @param id 豆瓣图书ID
 * @returns 图书详情或null（获取失败时）
 */
export async function fetchDoubanBookDetail(id: string): Promise<DoubanBookDetail | null> {
  const cached = checkSearchCache('douban-book-detail', id);
  if (cached) return JSON.parse(cached);

  try {
    const html = await doubanFetch(`https://book.douban.com/subject/${id}/`);
    if (isBlocked(html)) return null;

    const $ = cheerio.load(html);

    // Rating
    const ratingText =
      $('#interest_sectl .rating_num').text().trim() || $('[property="v:average"]').text().trim();
    const rating = ratingText ? Number(ratingText) : undefined;

    // Summary
    const summary =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';
    const cleanSummary = summary.replace(/^.+?简介[：:]\s*/, '').trim();

    // Info fields from #info span.pl
    const info: Record<string, string> = {};
    $('#info')
      .find('.pl')
      .each((_, el) => {
        const label = $(el).text().trim().replace(/:$/, '');
        let value = '';
        let next = el.nextSibling;
        while (next) {
          if (next.type === 'text') value += $(next).text().trim();
          else if (next.type === 'tag' && (next as any).name === 'a')
            value += $(next).text().trim();
          else if (next.type === 'tag' && (next as any).name === 'br') break;
          else if (next.type === 'tag' && (next as any).name === 'span') break;
          next = next.nextSibling;
        }
        info[label] = value.trim();
      });

    // Author from LD+JSON
    let author: string[] | undefined;
    try {
      const ldJson = $('script[type="application/ld+json"]').text();
      if (ldJson) {
        const parsed = JSON.parse(ldJson);
        if (parsed.author) {
          author = Array.isArray(parsed.author)
            ? parsed.author.map((a: any) => a.name)
            : [parsed.author.name || String(parsed.author)];
        }
      }
    } catch {
      // fallback
    }
    if (!author || author.length === 0) {
      const authorText = info['作者'] || info['作者'];
      if (authorText) author = authorText.split('/').map((s: string) => s.trim());
    }

    const isbn = $('meta[property="book:isbn"]').attr('content') || info['ISBN'] || undefined;
    const yearMatch = (info['出版年'] || '').match(/(\d{4})/);
    const year = yearMatch ? Number(yearMatch[1]) : undefined;
    const pageCountMatch = (info['页数'] || '').match(/(\d+)/);
    const page_count = pageCountMatch ? Number(pageCountMatch[1]) : undefined;

    const detail: DoubanBookDetail = {
      rating,
      summary: cleanSummary || undefined,
      author,
      publisher: info['出版社'] || undefined,
      year,
      isbn,
      page_count,
      price: info['定价'] || undefined,
      series: info['丛书'] || undefined,
    };

    cacheSearchResult('douban-book-detail', id, detail);
    return detail;
  } catch {
    return null;
  }
}

// ---- 搜索结果接口定义 ----

/**
 * 豆瓣媒体搜索结果数据结构
 */
export interface DoubanMediaResult {
  id: string; // 豆瓣ID
  title: string; // 标题
  original_title?: string; // 原名
  year?: number; // 年份
  img?: string; // 封面图片URL
  url: string; // 豆瓣详情页URL
  type?: string; // 类型（movie/tv）
  episode?: string; // 集数信息（电视剧）
}

/**
 * 豆瓣图书搜索结果数据结构
 */
export interface DoubanBookResult {
  id: string; // 豆瓣ID
  title: string; // 书名
  author: string[]; // 作者列表
  year?: number; // 出版年份
  img?: string; // 封面图片URL
  url: string; // 豆瓣详情页URL
}

// ---- 媒体搜索功能 ----

/**
 * 搜索豆瓣媒体（电影/电视剧）
 * 支持缓存，避免重复搜索
 * @param query 搜索关键词
 * @returns 媒体搜索结果数组
 */
export async function searchDoubanMedia(query: string): Promise<DoubanMediaResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const cached = checkSearchCache('douban-media', q);
  if (cached) return JSON.parse(cached);

  try {
    const html = await rateLimitedFetch(DOUBAN_MOVIE_SUGGEST, { q });
    if (isBlocked(html)) return [];

    const raw = JSON.parse(html) as Array<Record<string, unknown>>;
    if (!Array.isArray(raw) || raw.length === 0) return [];

    const results: DoubanMediaResult[] = raw.slice(0, 10).map((item) => ({
      id: String(item.id ?? ''),
      title: (item.title as string) || '',
      original_title: (item.sub_title as string) || undefined,
      year: item.year ? Number(item.year) : undefined,
      img: (item.img as string) || undefined,
      url: (item.url as string) || `https://movie.douban.com/subject/${item.id}/`,
      type: (item.type as string) || (item.episode ? 'tv' : 'movie'),
      episode: (item.episode as string) || undefined,
    }));

    cacheSearchResult('douban-media', q, results);
    return results;
  } catch {
    return [];
  }
}

// ---- 图书搜索功能 ----

/**
 * 搜索豆瓣图书
 * 支持缓存，避免重复搜索
 * @param query 搜索关键词
 * @returns 图书搜索结果数组
 */
export async function searchDoubanBooks(query: string): Promise<DoubanBookResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const cached = checkSearchCache('douban-books', q);
  if (cached) return JSON.parse(cached);

  try {
    const html = await rateLimitedFetch(DOUBAN_BOOK_SUGGEST, { q });
    if (isBlocked(html)) return [];

    const raw = JSON.parse(html) as Array<Record<string, unknown>>;
    if (!Array.isArray(raw) || raw.length === 0) return [];

    const results: DoubanBookResult[] = raw.slice(0, 10).map((item) => ({
      id: String(item.id ?? ''),
      title: (item.title as string) || '',
      author: item.author_name ? [item.author_name as string] : [],
      year: item.year ? Number(item.year) : undefined,
      img: (item.pic as string) || (item.img as string) || undefined,
      url: (item.url as string) || `https://book.douban.com/subject/${item.id}/`,
    }));

    cacheSearchResult('douban-books', q, results);
    return results;
  } catch {
    return [];
  }
}

// ---- 工具函数 ----

/**
 * 转换豆瓣图片URL尺寸
 * 豆瓣默认返回小图，此函数可转换为指定尺寸
 * @param img 原始图片URL
 * @param size 目标尺寸（s=小图, m=中图, l=大图）
 * @returns 转换后的图片URL或null
 */
export function doubanImageUrl(
  img: string | undefined,
  size: 's' | 'm' | 'l' = 'm',
): string | null {
  if (!img) return null;
  return img.replace(/\/s_ratio_poster\//, '/l_ratio_poster/').replace(/\/s\//, `/${size}/`);
}
