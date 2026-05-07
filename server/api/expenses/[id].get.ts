import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const expense = getDb().get('SELECT * FROM expenses WHERE id = ?', id);
  if (!expense) throw createError({ statusCode: 404, message: 'Expense not found' });
  return { success: true, data: expense };
});
