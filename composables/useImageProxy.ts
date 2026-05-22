/**
 * 图片代理与缩略图工具
 * - 外部URL走本地代理绕过防盗链
 * - 本地照片自动返回缩略图路径（列表/卡片用）
 */

function thumbPath(path: string): string {
  const dot = path.lastIndexOf('.');
  if (dot === -1) return path;
  return path.slice(0, dot) + '_thumb' + path.slice(dot);
}

export function useImageProxy() {
  function proxyUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('/photos/') || url.startsWith('/api/')) return url;
    if (/^https?:\/\//.test(url)) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  }

  /** 用于卡片/列表视图 — 本地图片返回缩略图，外部URL走代理 */
  function thumbnailUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('/photos/')) return thumbPath(url);
    return proxyUrl(url);
  }

  return { proxyUrl, thumbnailUrl };
}
