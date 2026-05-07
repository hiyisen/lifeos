import { getDb } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody<{ status: 'todo' | 'in_progress' | 'done' }>(event);

  if (!body.status || !['todo', 'in_progress', 'done'].includes(body.status)) {
    throw createError({ statusCode: 400, message: 'invalid status' });
  }

  const db = getDb();
  const task = db.get('SELECT * FROM tasks WHERE id = ?', id);
  if (!task) throw createError({ statusCode: 404, message: 'Task not found' });

  if (body.status === 'done') {
    db.run(
      'UPDATE tasks SET status = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      body.status,
      id,
    );
  } else {
    db.run(
      'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      body.status,
      id,
    );
  }

  return { success: true, data: db.get('SELECT * FROM tasks WHERE id = ?', id) };
});
