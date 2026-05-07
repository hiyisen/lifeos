import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody<{
    title: string; platform: string; genre?: string;
    rating?: number; review?: string; cover_path?: string;
    source_id?: string; source_url?: string; status?: string;
    play_hours?: number; year?: number;
  }>(event);

  if (!body.title || !body.platform) {
    throw createError({ statusCode: 400, message: 'title and platform are required' });
  }

  const db = getDb();
  if (!db.get('SELECT id FROM games WHERE id = ?', id)) {
    throw createError({ statusCode: 404, message: 'Game not found' });
  }

  db.run(
    `UPDATE games SET title=?, platform=?, genre=?, rating=?, review=?, cover_path=?, source_id=?, source_url=?, status=?, play_hours=?, year=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
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
    id,
  );
  return { success: true, data: db.get('SELECT * FROM games WHERE id = ?', id) };
});
