import { getDb } from '../../utils/db';
import { deletePhotos } from '../../utils/photo';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id) throw createError({ statusCode: 400, message: 'id is required' });

  const db = getDb();
  const food = db.get<{ photo_paths: string | null }>(
    'SELECT photo_paths FROM foods WHERE id = ?',
    id,
  );
  if (!food) throw createError({ statusCode: 404, message: 'Food not found' });

  if (food.photo_paths) {
    try {
      const paths = JSON.parse(food.photo_paths) as string[];
      deletePhotos(paths);
    } catch {
      // ignore parse errors
    }
  }

  db.run('DELETE FROM foods WHERE id = ?', id);
  return { success: true, data: null };
});
