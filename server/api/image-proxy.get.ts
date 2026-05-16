/**
 * 图片代理端点
 * 用于绕过豆瓣等外部图片的防盗链限制
 * 仅代理白名单内的域名
 */

// 允许代理的图片域名白名单
const ALLOWED_DOMAINS = [
  'doubanio.com',
  'douban.com',
  'img1.doubanio.com',
  'img2.doubanio.com',
  'img3.doubanio.com',
  'img9.doubanio.com',
];

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = String(query.url || '').trim();
  if (!url) throw createError({ statusCode: 400, message: 'Missing url param' });

  const hostname = new URL(url).hostname;
  if (!ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d))) {
    throw createError({ statusCode: 403, message: 'Domain not allowed' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Referer: 'https://movie.douban.com/',
      },
    });

    if (!response.ok) throw createError({ statusCode: 404 });

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    setHeader(event, 'Content-Type', contentType);
    setHeader(event, 'Cache-Control', 'public, max-age=86400');
    return new Uint8Array(await response.arrayBuffer());
  } catch (e: any) {
    throw createError({ statusCode: 502, message: e.message || 'Proxy error' });
  }
});
