import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const db = getDb();
  if (!db.get('SELECT id FROM expenses WHERE id = ?', id)) {
    throw createError({ statusCode: 404, message: 'Expense not found' });
  }
  db.run('DELETE FROM expenses WHERE id = ?', id);
  return { success: true, data: null };
});
