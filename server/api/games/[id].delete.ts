import { getDb } from '../../utils/db';
import { deletePhoto } from '../../utils/photo';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const db = getDb();
  const game = db.get<{ cover_path: string | null }>(
    'SELECT cover_path FROM games WHERE id = ?',
    id,
  );
  if (!game) throw createError({ statusCode: 404, message: 'Game not found' });
  if (game.cover_path) deletePhoto(game.cover_path);
  db.run('DELETE FROM games WHERE id = ?', id);
  return { success: true, data: null };
});
