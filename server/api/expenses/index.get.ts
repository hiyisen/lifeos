import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const db = getDb();

  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const params: unknown[] = [];

  if (query.category) {
    sql += ' AND category = ?';
    params.push(query.category);
  }
  if (query.type) {
    sql += ' AND type = ?';
    params.push(query.type);
  }
  if (query.date_from) {
    sql += ' AND record_date >= ?';
    params.push(query.date_from);
  }
  if (query.date_to) {
    sql += ' AND record_date <= ?';
    params.push(query.date_to);
  }
  if (query.search) {
    sql += ' AND note LIKE ?';
    params.push(`%${query.search}%`);
  }

  const { total } = db.get<{ total: number }>(
    sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
    ...params,
  ) ?? { total: 0 };
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Number(query.limit) || 20);
  sql += ' ORDER BY record_date DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  return { success: true, data: db.all(sql, ...params), meta: { total, page, pageSize: limit } };
});
