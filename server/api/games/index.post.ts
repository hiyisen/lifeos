import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    title: string;
    platform: string;
    genre?: string;
    rating?: number;
    review?: string;
    cover_path?: string;
    source_id?: string;
    source_url?: string;
    status?: string;
    play_hours?: number;
    year?: number;
  }>(event);

  if (!body.title || !body.platform)
    throw createError({ statusCode: 400, message: 'title and platform are required' });

  const db = getDb();
  const result = db.run(
    `INSERT INTO games (title, platform, genre, rating, review, cover_path, source_id, source_url, status, play_hours, year)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    body.title,
    body.platform,
    body.genre || null,
    body.rating || null,
    body.review || null,
    body.cover_path || null,
    body.source_id || null,
    body.source_url || null,
    body.status || 'wishlist',
    body.play_hours ?? 0,
    body.year || null,
  );
  return {
    success: true,
    data: db.get('SELECT * FROM games WHERE id = ?', result.lastInsertRowid),
  };
});
