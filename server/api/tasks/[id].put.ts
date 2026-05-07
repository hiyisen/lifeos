import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody<{
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    category?: string;
    due_date?: string;
    is_recurring?: boolean;
    recur_type?: string;
    linked_module?: string;
    linked_id?: number;
    completed_at?: string;
  }>(event);

  if (!body.title) throw createError({ statusCode: 400, message: 'title is required' });

  const db = getDb();

  if (!db.get('SELECT id FROM tasks WHERE id = ?', id)) {
    throw createError({ statusCode: 404, message: 'Task not found' });
  }

  db.run(
    `UPDATE tasks SET title=?, description=?, priority=?, status=?, category=?, due_date=?, is_recurring=?, recur_type=?, linked_module=?, linked_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    body.title,
    body.description || null,
    body.priority || 'medium',
    body.status || 'todo',
    body.category || null,
    body.due_date || null,
    body.is_recurring ? 1 : 0,
    body.recur_type || null,
    body.linked_module || null,
    body.linked_id || null,
    id,
  );

  if (body.status === 'done' && !body.completed_at) {
    db.run('UPDATE tasks SET completed_at = CURRENT_TIMESTAMP WHERE id = ?', id);
  }

  return { success: true, data: db.get('SELECT * FROM tasks WHERE id = ?', id) };
});
