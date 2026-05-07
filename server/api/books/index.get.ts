import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const db = getDb();

  let sql = 'SELECT * FROM books WHERE 1=1';
  const params: unknown[] = [];

  if (query.type) {
    sql += ' AND type = ?';
    params.push(query.type);
  }
  if (query.status) {
    sql += ' AND status = ?';
    params.push(query.status);
  }
  if (query.rating_min) {
    sql += ' AND rating >= ?';
    params.push(Number(query.rating_min));
  }
  if (query.search) {
    sql += ' AND (title LIKE ? OR author LIKE ?)';
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  const { total } = db.get<{ total: number }>(
    sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
    ...params,
  ) ?? { total: 0 };
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Number(query.limit) || 20);
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  return { success: true, data: db.all(sql, ...params), meta: { total, page, pageSize: limit } };
});
