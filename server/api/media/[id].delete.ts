import { getDb } from '../../utils/db';
import { deletePhoto } from '../../utils/photo';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const db = getDb();
  const media = db.get<{ poster_path: string | null }>(
    'SELECT poster_path FROM media WHERE id = ?',
    id,
  );
  if (!media) throw createError({ statusCode: 404, message: 'Media not found' });
  if (media.poster_path) deletePhoto(media.poster_path);
  db.run('DELETE FROM media WHERE id = ?', id);
  return { success: true, data: null };
});
