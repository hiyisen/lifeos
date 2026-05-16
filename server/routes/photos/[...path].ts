/**
 * 照片静态文件服务路由
 * 提供存储在本地的照片文件的HTTP访问服务
 * 包含目录遍历防护和长期缓存策略
 */

import { createReadStream, existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';

// 照片存储根目录（可通过环境变量配置）
const PHOTOS_DIR = resolve(process.env.NUXT_PHOTOS_DIR || './data/photos');

// 支持的图片格式MIME类型映射
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

export default defineEventHandler((event) => {
  // 从URL参数中获取请求的文件路径
  const filePath = event.context.params?.path || '';
  const fullPath = resolve(PHOTOS_DIR, filePath);

  // 安全检查：防止目录遍历攻击
  // 确保请求的文件路径在照片目录内，且文件确实存在
  if (!fullPath.startsWith(PHOTOS_DIR) || !existsSync(fullPath)) {
    throw createError({ statusCode: 404, message: 'Photo not found' });
  }

  // 根据文件扩展名确定MIME类型，默认为JPEG
  const mimeType = MIME_TYPES[extname(fullPath).toLowerCase()] || 'image/jpeg';

  // 设置响应头
  setHeader(event, 'Content-Type', mimeType);
  // 设置长期缓存（1年），因为照片文件名包含UUID，内容变更时URL也会变化
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');

  // 返回文件流
  return sendStream(event, createReadStream(fullPath));
});
