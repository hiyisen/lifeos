import { createReadStream, existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';

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

export default defineEventHandler((event) => {
  const filePath = event.context.params?.path || '';
  const fullPath = resolve(PHOTOS_DIR, filePath);

  // Prevent directory traversal
  if (!fullPath.startsWith(PHOTOS_DIR) || !existsSync(fullPath)) {
    throw createError({ statusCode: 404, message: 'Photo not found' });
  }

  const mimeType = MIME_TYPES[extname(fullPath).toLowerCase()] || 'image/jpeg';

  setHeader(event, 'Content-Type', mimeType);
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
  return sendStream(event, createReadStream(fullPath));
});
