import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const db = getDb();
  if (!db.get('SELECT id FROM tasks WHERE id = ?', id)) {
    throw createError({ statusCode: 404, message: 'Task not found' });
  }
  db.run('DELETE FROM tasks WHERE id = ?', id);
  return { success: true, data: null };
});
