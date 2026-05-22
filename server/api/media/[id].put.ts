import { getDb } from '../../utils/db';
import { savePhotoFromUrl, deletePhoto } from '../../utils/photo';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);
  const db = getDb();

  const existing = db.get('SELECT * FROM media WHERE id = ?', id) as Record<string, any>;
  if (!existing) throw createError({ statusCode: 404, message: 'Media not found' });

  // Download poster to local storage if it's a new external URL
  let posterPath = body.poster_path;
  if (posterPath && /^https?:\/\//.test(posterPath)) {
    const localPath = await savePhotoFromUrl(posterPath, 'media');
    if (localPath !== posterPath) {
      // Delete old local poster if it was stored locally
      if (typeof existing.poster_path === 'string' && existing.poster_path.startsWith('/photos/')) {
        deletePhoto(existing.poster_path);
      }
      posterPath = localPath;
    }
  }

  db.run(
    `UPDATE media SET title=?, type=?, year=?, director=?, actors=?, genres=?, original_title=?, rating=?, summary=?, review=?, runtime=?, release_date=?, imdb_id=?, poster_path=?, source_id=?, source_url=?, status=?, current_season=?, current_episode=?, total_episodes=?, viewed_at=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
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
    posterPath || null,
    body.source_id || null,
    body.source_url || null,
    body.status || 'wishlist',
    body.current_season || 1,
    body.current_episode || 0,
    body.total_episodes || null,
    body.viewed_at || null,
    id,
  );
  return { success: true, data: db.get('SELECT * FROM media WHERE id = ?', id) };
});
