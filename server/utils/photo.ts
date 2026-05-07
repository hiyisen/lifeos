import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { resolve, extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

const PHOTOS_DIR = resolve(process.env.NUXT_PHOTOS_DIR || './data/photos');

export function savePhoto(file: { data: Buffer; filename: string }, module: string): string {
  const dir = join(PHOTOS_DIR, module);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const ext = extname(file.filename) || '.jpg';
  const filename = `${randomUUID()}${ext}`;
  writeFileSync(join(dir, filename), file.data);
  return `/photos/${module}/${filename}`;
}

export function deletePhoto(path: string): void {
  const relativePath = path.replace(/^\/photos\//, '');
  const fullPath = join(PHOTOS_DIR, relativePath);
  if (existsSync(fullPath)) unlinkSync(fullPath);
}

export function deletePhotos(paths: string[]): void {
  for (const path of paths) {
    deletePhoto(path);
  }
}
