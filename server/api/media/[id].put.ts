import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);
  const db = getDb();

  const existing = db.get('SELECT * FROM media WHERE id = ?', id);
  if (!existing) throw createError({ statusCode: 404, message: 'Media not found' });

  db.run(
    `UPDATE media SET title=?, type=?, year=?, director=?, actors=?, genres=?, original_title=?, rating=?, summary=?, review=?, runtime=?, release_date=?, imdb_id=?, poster_path=?, source_id=?, source_url=?, status=?, current_season=?, current_episode=?, total_episodes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    body.title,
    body.type,
    body.year || null,
    body.director || null,
    body.actors || null,
    JSON.stringify(body.genres || []),
    body.original_title || null,
    body.rating || null,
    body.summary || null,
    body.review || null,
    body.runtime || null,
    body.release_date || null,
    body.imdb_id || null,
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
