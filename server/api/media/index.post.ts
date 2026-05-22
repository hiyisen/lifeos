import { getDb } from '../../utils/db';
import { savePhotoFromUrl } from '../../utils/photo';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    title: string;
    type: string;
    year?: number;
    director?: string;
    actors?: string;
    genres?: string[];
    original_title?: string;
    rating?: number;
    summary?: string;
    review?: string;
    runtime?: number;
    release_date?: string;
    imdb_id?: string;
    poster_path?: string;
    source_id?: string;
    source_url?: string;
    status?: string;
    current_season?: number;
    current_episode?: number;
    total_episodes?: number;
    viewed_at?: string;
  }>(event);

  if (!body.title || !body.type)
    throw createError({ statusCode: 400, message: 'title and type are required' });

  // Download poster to local storage if it's an external URL
  if (body.poster_path && /^https?:\/\//.test(body.poster_path)) {
    body.poster_path = await savePhotoFromUrl(body.poster_path, 'media');
  }

  const db = getDb();
  const result = db.run(
    `INSERT INTO media (title, type, year, director, actors, genres, original_title, rating, summary, review, runtime, release_date, imdb_id, poster_path, source_id, source_url, status, current_season, current_episode, total_episodes, viewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    body.viewed_at || null,
  );
  const media = db.get('SELECT * FROM media WHERE id = ?', result.lastInsertRowid);
  return { success: true, data: media };
});
