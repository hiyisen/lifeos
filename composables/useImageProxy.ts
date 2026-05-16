/**
 * 图片代理工具
 * 将豆瓣等外部图片URL转换为本地代理URL
 * 已保存的本地图片（/photos/...）直接返回原URL
 */
export function useImageProxy() {
  function proxyUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('/photos/') || url.startsWith('/api/')) return url;
    if (/^https?:\/\//.test(url)) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  }

  return { proxyUrl };
}
