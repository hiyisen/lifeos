/**
 * 照片处理工具模块
 * 提供照片的保存、删除等文件操作功能
 * 照片按模块分类存储在指定目录中
 */

import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { resolve, extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

// 照片存储根目录，可通过环境变量配置
const PHOTOS_DIR = resolve(process.env.NUXT_PHOTOS_DIR || './data/photos');

/**
 * 保存上传的照片文件
 * 自动生成唯一文件名，按模块分类存储
 * @param file 上传的文件对象（包含数据和原始文件名）
 * @param module 所属模块（如books、games、foods等）
 * @returns 照片的访问路径（用于前端显示）
 */
export function savePhoto(file: { data: Buffer; filename: string }, module: string): string {
  const dir = join(PHOTOS_DIR, module);
  // 确保模块目录存在
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  // 获取文件扩展名，如果没有则默认使用.jpg
  const ext = extname(file.filename) || '.jpg';
  // 生成唯一文件名避免冲突
  const filename = `${randomUUID()}${ext}`;
  writeFileSync(join(dir, filename), file.data);
  // 返回相对路径供前端访问
  return `/photos/${module}/${filename}`;
}

/**
 * 删除单张照片
 * 根据访问路径删除对应的物理文件
 * @param path 照片的访问路径（如/photos/books/uuid.jpg）
 */
export function deletePhoto(path: string): void {
  const relativePath = path.replace(/^\/photos\//, '');
  const fullPath = join(PHOTOS_DIR, relativePath);
  if (existsSync(fullPath)) unlinkSync(fullPath);
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
 * 从远程URL下载图片并保存到本地
 * 用于解决豆瓣等外部图片的防盗链问题
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
    writeFileSync(join(dir, filename), buffer);
    return `/photos/${module}/${filename}`;
  } catch {
    return url;
  }
}
