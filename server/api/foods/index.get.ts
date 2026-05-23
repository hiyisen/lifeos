import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const db = getDb();

  let sql = 'SELECT * FROM foods WHERE 1=1';
  const params: unknown[] = [];

  if (query.cuisine) {
    sql += ' AND cuisine_tag = ?';
    params.push(query.cuisine);
  }
  if (query.rating_min) {
    sql += ' AND rating >= ?';
    params.push(Number(query.rating_min));
  }
  if (query.date_from) {
    sql += ' AND visited_at >= ?';
    params.push(query.date_from);
  }
  if (query.date_to) {
    sql += ' AND visited_at <= ?';
    params.push(query.date_to);
  }
  if (query.search) {
    sql += ' AND (name LIKE ? OR restaurant LIKE ?)';
    const s = `%${query.search}%`;
    params.push(s, s);
  }

  // Total count
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const { total } = db.get<{ total: number }>(countSql, ...params) ?? { total: 0 };

  // Pagination
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Number(query.limit) || 20);
  const offset = (page - 1) * limit;

  const sort = String(query.sort || 'visited_at');
  switch (sort) {
    case 'rating':
      sql += ' ORDER BY rating DESC NULLS LAST, created_at DESC';
      break;
    case 'created_at':
      sql += ' ORDER BY created_at DESC';
      break;
    default:
      sql += ' ORDER BY visited_at DESC, created_at DESC';
  }
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const foods = db.all(sql, ...params);

  // Parse photo_paths JSON
  for (const food of foods) {
    if (food.photo_paths) {
      try {
        food.photo_paths = JSON.parse(food.photo_paths as string);
      } catch {
        food.photo_paths = [];
      }
    } else {
      food.photo_paths = [];
    }
  }

  return {
    success: true,
    data: foods,
    meta: { total, page, pageSize: limit },
  };
});
