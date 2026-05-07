import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);
  const db = getDb();

  const existing = db.get('SELECT * FROM media WHERE id = ?', id);
  if (!existing) throw createError({ statusCode: 404, message: 'Media not found' });

  db.run(
    `UPDATE media SET title=?, type=?, year=?, director=?, rating=?, review=?, poster_path=?, source_id=?, source_url=?, status=?, current_season=?, current_episode=?, total_episodes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    body.title,
    body.type,
    body.year || null,
    body.director || null,
    body.rating || null,
    body.review || null,
    body.poster_path || null,
    body.source_id || null,
    body.source_url || null,
    body.status || 'wishlist',
    body.current_season || 1,
    body.current_episode || 0,
    body.total_episodes || null,
    id,
  );
  return { success: true, data: db.get('SELECT * FROM media WHERE id = ?', id) };
});
