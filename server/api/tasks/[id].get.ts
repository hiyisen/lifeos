import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const task = getDb().get('SELECT * FROM tasks WHERE id = ?', id);
  if (!task) throw createError({ statusCode: 404, message: 'Task not found' });
  return { success: true, data: task };
});
