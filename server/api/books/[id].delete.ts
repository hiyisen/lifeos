import { getDb } from '../../utils/db';
import { deletePhoto } from '../../utils/photo';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const db = getDb();
  const book = db.get<{ cover_path: string | null }>(
    'SELECT cover_path FROM books WHERE id = ?',
    id,
  );
  if (!book) throw createError({ statusCode: 404, message: 'Book not found' });
  if (book.cover_path) deletePhoto(book.cover_path);
  db.run('DELETE FROM books WHERE id = ?', id);
  return { success: true, data: null };
});
