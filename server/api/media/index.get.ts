import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const db = getDb();

  let sql = 'SELECT * FROM media WHERE 1=1';
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
  if (query.year) {
    sql += ' AND year = ?';
    params.push(Number(query.year));
  }
  if (query.search) {
    sql += ' AND (title LIKE ? OR director LIKE ?)';
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  const { total } = db.get<{ total: number }>(
    sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
    ...params,
  ) ?? { total: 0 };

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Number(query.limit) || 20);

  const sort = String(query.sort || 'created_at');
  switch (sort) {
    case 'viewed_at':
      sql += ' ORDER BY viewed_at DESC NULLS LAST, created_at DESC';
      break;
    case 'release_date':
      sql += ' ORDER BY release_date DESC, created_at DESC';
      break;
    case 'rating':
      sql += ' ORDER BY rating DESC NULLS LAST, created_at DESC';
      break;
    default:
      sql += ' ORDER BY created_at DESC';
  }
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  return { success: true, data: db.all(sql, ...params), meta: { total, page, pageSize: limit } };
});
