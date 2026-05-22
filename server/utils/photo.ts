/**
 * 照片处理工具模块
 * 提供照片的保存、删除、缩略图生成等功能
 * 照片按模块分类存储在指定目录中
 */

import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { resolve, extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

// 照片存储根目录，可通过环境变量配置
const PHOTOS_DIR = resolve(process.env.NUXT_PHOTOS_DIR || './data/photos');

// 缩略图最大宽度
const THUMB_WIDTH = 400;

/**
 * 生成缩略图
 * @param buffer 原始图片数据
 * @param basePath 原始文件完整路径
 * @returns 缩略图文件名
 */
async function generateThumbnail(buffer: Buffer, basePath: string): Promise<string> {
  const ext = extname(basePath);
  const thumbBase = basePath.slice(0, -ext.length) + '_thumb' + ext;
  const thumbBuffer = await sharp(buffer)
    .resize(THUMB_WIDTH, undefined, { withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer();
  writeFileSync(thumbBase, thumbBuffer);
  return thumbBase;
}

/**
 * 获取缩略图路径（从原始路径推导）
 * @param path 原始照片路径（如 /photos/foods/uuid.jpg）
 * @returns 缩略图路径
 */
function thumbPath(path: string): string {
  const ext = extname(path);
  return path.slice(0, -ext.length) + '_thumb' + ext;
}

/**
 * 保存上传的照片文件
 * 自动生成唯一文件名和缩略图
 * @param file 上传的文件对象（包含数据和原始文件名）
 * @param module 所属模块（如books、games、foods等）
 * @returns 照片的访问路径
 */
export function savePhoto(file: { data: Buffer; filename: string }, module: string): string {
  const dir = join(PHOTOS_DIR, module);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const ext = extname(file.filename) || '.jpg';
  const filename = `${randomUUID()}${ext}`;
  const fullPath = join(dir, filename);
  writeFileSync(fullPath, file.data);
  // Generate thumbnail asynchronously, fire-and-forget
  generateThumbnail(file.data, fullPath).catch(() => {});
  return `/photos/${module}/${filename}`;
}

/**
 * 删除单张照片（同时删除对应的缩略图）
 * @param path 照片的访问路径（如/photos/books/uuid.jpg）
 */
export function deletePhoto(path: string): void {
  const relativePath = path.replace(/^\/photos\//, '');
  const fullPath = join(PHOTOS_DIR, relativePath);
  if (existsSync(fullPath)) unlinkSync(fullPath);
  // Also delete thumbnail
  const thumbFullPath = join(PHOTOS_DIR, thumbPath(relativePath));
  if (existsSync(thumbFullPath)) unlinkSync(thumbFullPath);
}

/**
 * 批量删除照片
 * @param paths 照片访问路径数组
 */
export function deletePhotos(paths: string[]): void {
  for (const path of paths) {
    deletePhoto(path);
  }
}

/**
 * 从远程URL下载图片并保存到本地（含缩略图）
 * @param url 远程图片URL
 * @param module 所属模块
 * @returns 本地访问路径，失败时返回原URL
 */
export async function savePhotoFromUrl(url: string, module: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Referer: 'https://movie.douban.com/',
      },
    });
    if (!response.ok) return url;
    const buffer = Buffer.from(await response.arrayBuffer());
    const urlPath = new URL(url).pathname;
    const ext = extname(urlPath) || '.jpg';
    const dir = join(PHOTOS_DIR, module);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const filename = `${randomUUID()}${ext}`;
    const fullPath = join(dir, filename);
    writeFileSync(fullPath, buffer);
    generateThumbnail(buffer, fullPath).catch(() => {});
    return `/photos/${module}/${filename}`;
  } catch {
    return url;
  }
}

/**
 * 将照片路径转换为缩略图路径（用于列表/卡片视图）
 * 本地照片返回缩略图路径，外部URL走代理
 * @param path 原始照片路径
 * @returns 缩略图路径或代理URL
 */
export function getThumbnailPath(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('/photos/')) return thumbPath(path);
  return path;
}
