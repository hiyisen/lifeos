import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const db = getDb();

  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params: unknown[] = [];

  if (query.status) {
    sql += ' AND status = ?';
    params.push(query.status);
  }
  if (query.priority) {
    sql += ' AND priority = ?';
    params.push(query.priority);
  }
  if (query.category) {
    sql += ' AND category = ?';
    params.push(query.category);
  }
  if (query.search) {
    sql += ' AND title LIKE ?';
    params.push(`%${query.search}%`);
  }

  const { total } = db.get<{ total: number }>(
    sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
    ...params,
  ) ?? { total: 0 };
  sql +=
    " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, due_date ASC, created_at DESC";

  return { success: true, data: db.all(sql, ...params), meta: { total, page: 1, pageSize: total } };
});
