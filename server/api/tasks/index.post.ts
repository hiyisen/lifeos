import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    title: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    status?: 'todo' | 'in_progress' | 'done';
    category?: string;
    due_date?: string;
    is_recurring?: boolean;
    recur_type?: 'daily' | 'weekly' | 'monthly';
    linked_module?: string;
    linked_id?: number;
  }>(event);

  if (!body.title) throw createError({ statusCode: 400, message: 'title is required' });

  const db = getDb();
  const result = db.run(
    `INSERT INTO tasks (title, description, priority, status, category, due_date, is_recurring, recur_type, linked_module, linked_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  );
  return {
    success: true,
    data: db.get('SELECT * FROM tasks WHERE id = ?', result.lastInsertRowid),
  };
});
