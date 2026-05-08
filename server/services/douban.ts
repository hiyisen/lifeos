import { checkSearchCache, cacheSearchResult } from '../utils/cache';

const DOUBAN_MOVIE_SUGGEST = 'https://movie.douban.com/j/subject_suggest';
const DOUBAN_BOOK_SUGGEST = 'https://book.douban.com/j/subject_suggest';

// ---- Rate Limiter ----

let lastRequestTime = 0;
const MIN_INTERVAL = 1500;

async function rateLimitedFetch(url: string, params: Record<string, string>): Promise<string> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL) {
    const jitter = Math.random() * 1000;
    await new Promise((r) => setTimeout(r, MIN_INTERVAL - elapsed + jitter));
  }
  lastRequestTime = Date.now();

  const bid = Array.from(
    { length: 11 },
    () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)],
  ).join('');

  const searchUrl = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    searchUrl.searchParams.set(k, v);
  }

  const response = await fetch(searchUrl.toString(), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Cookie: `bid=${bid}`,
    },
  });

  return response.text();
}

function isBlocked(html: string): boolean {
  return /captcha|verify|robot|检测|验证码/.test(html);
}

// ---- Media Types ----

export interface DoubanMediaResult {
  id: string;
  title: string;
  original_title?: string;
  year?: number;
  img?: string;
  url: string;
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
