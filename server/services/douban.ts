import * as cheerio from 'cheerio';
import { checkSearchCache, cacheSearchResult } from '../utils/cache';

const DOUBAN_MOVIE_SUGGEST = 'https://movie.douban.com/j/subject_suggest';
const DOUBAN_BOOK_SUGGEST = 'https://book.douban.com/j/subject_suggest';

// ---- Rate Limiter ----

let lastRequestTime = 0;
const MIN_INTERVAL = 1500;

// Shared session bid — rotate on each request but keep consistent across fetch calls
function generateBid(): string {
  return Array.from(
    { length: 11 },
    () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)],
  ).join('');
}

let sessionBid = generateBid();

const BASE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL) {
    const jitter = Math.random() * 1000;
    await new Promise((r) => setTimeout(r, MIN_INTERVAL - elapsed + jitter));
  }
  lastRequestTime = Date.now();
  sessionBid = generateBid();
}

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

function isBlocked(html: string): boolean {
  // Detect Douban's JS challenge page — it has a specific form with SHA-512 proof-of-work
  return /function sha512/.test(html) && /name="sec"/.test(html) && /name="cha"/.test(html);
}

// ---- Media Detail ----

export interface DoubanMediaDetail {
  rating?: number;
  summary?: string;
  year?: number;
  genres: string[];
  country?: string;
  language?: string;
  runtime?: number;
  release_date?: string;
  original_title?: string;
  directors: string[];
  actors: string[];
  imdb_id?: string;
}

export async function fetchDoubanMediaDetail(id: string): Promise<DoubanMediaDetail | null> {
  const cached = checkSearchCache('douban-media-detail', id);
  if (cached) return JSON.parse(cached);

  try {
    const html = await doubanFetch(`https://m.douban.com/movie/subject/${id}/`, true);
    if (isBlocked(html)) return null;

    const $ = cheerio.load(html);

    // Rating from meta
    const rating =
      $('meta[itemprop="ratingValue"]').attr('content') ||
      ($('meta[property="og:description"]').attr('content') || '').match(
        /豆瓣评分[：:]\s*([\d.]+)/,
      )?.[1];

    // Summary
    const summary =
      $('meta[itemprop="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    // Strip "XXX豆瓣评分：X.X 简介：" prefix from summary
    const cleanSummary = summary.replace(/^.+?简介[：:]\s*/, '').trim();

    // Year from meta or text
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const yearMatch = metaDesc.match(/\((\d{4})\)/);
    const year = yearMatch ? Number(yearMatch[1]) : undefined;

    // Original title
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const original_title = ogTitle.replace(/\s*-\s*电影.*$/, '').trim() || undefined;

    // Genres and country from text like "美国 / 剧情 / 犯罪 / 1994-09-10上映 / 片长142分钟"
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
        // Extract just the YYYY-MM-DD part
        const dateMatch = rawDate.match(/(\d{4}-\d{2}-\d{2})/);
        release_date = dateMatch ? dateMatch[1] : rawDate;
      }
    }

    // Runtime
    const runtimeMatch = bodyText.match(/片长(\d+)分钟/);
    if (runtimeMatch) runtime = Number(runtimeMatch[1]);

    const detail: DoubanMediaDetail = {
      rating: rating ? Number(rating) : undefined,
      summary: cleanSummary || undefined,
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

// ---- Book Detail ----

export interface DoubanBookDetail {
  rating?: number;
  summary?: string;
  author?: string[];
  publisher?: string;
  year?: number;
  isbn?: string;
  page_count?: number;
  price?: string;
  series?: string;
}

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

// ---- Media Types ----

export interface DoubanMediaResult {
  id: string;
  title: string;
  original_title?: string;
  year?: number;
  img?: string;
  url: string;
  type?: string;
  episode?: string;
}

export interface DoubanBookResult {
  id: string;
  title: string;
  author: string[];
  year?: number;
  img?: string;
  url: string;
}

// ---- Media Search ----

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

// ---- Book Search ----

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

// ---- Helpers ----

export function doubanImageUrl(
  img: string | undefined,
  size: 's' | 'm' | 'l' = 'm',
): string | null {
  if (!img) return null;
  return img.replace(/\/s_ratio_poster\//, '/l_ratio_poster/').replace(/\/s\//, `/${size}/`);
}
