import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const book = getDb().get('SELECT * FROM books WHERE id = ?', id);
  if (!book) throw createError({ statusCode: 404, message: 'Book not found' });
  return { success: true, data: book };
});
