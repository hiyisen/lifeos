/**
 * 照片静态文件服务路由
 * 支持缩略图按需生成：访问 ..._thumb.jpg 时如不存在则自动生成
 */

import { createReadStream, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname, resolve, dirname } from 'node:path';
import sharp from 'sharp';

const PHOTOS_DIR = resolve(process.env.NUXT_PHOTOS_DIR || './data/photos');

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

export default defineEventHandler(async (event) => {
  const filePath = event.context.params?.path || '';
  const fullPath = resolve(PHOTOS_DIR, filePath);

  if (!fullPath.startsWith(PHOTOS_DIR)) {
    throw createError({ statusCode: 403 });
  }

  // Serve existing files directly
  if (existsSync(fullPath)) {
    const mimeType = MIME_TYPES[extname(fullPath).toLowerCase()] || 'image/jpeg';
    setHeader(event, 'Content-Type', mimeType);
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
    return sendStream(event, createReadStream(fullPath));
  }

  // Auto-generate missing thumbnail from original
  const ext = extname(filePath);
  if (filePath.includes('_thumb') && ext) {
    const origRelPath = filePath.replace('_thumb' + ext, ext);
    const origFullPath = resolve(PHOTOS_DIR, origRelPath);
    if (origFullPath.startsWith(PHOTOS_DIR) && existsSync(origFullPath)) {
      const thumbBuffer = await sharp(origFullPath)
        .resize(400, undefined, { withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();
      const dir = dirname(fullPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(fullPath, thumbBuffer);
      setHeader(event, 'Content-Type', 'image/jpeg');
      setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
      return thumbBuffer;
    }
  }

  throw createError({ statusCode: 404, message: 'Photo not found' });
});
