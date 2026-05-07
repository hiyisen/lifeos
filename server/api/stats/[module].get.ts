import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const module = getRouterParam(event, 'module');
  const validModules = ['foods', 'media', 'games', 'books', 'expenses', 'tasks'];
  if (!validModules.includes(module!)) {
    throw createError({ statusCode: 400, message: 'Invalid module' });
  }

  const db = getDb();
  const table = module!;
  const year = new Date().getFullYear();

  const total = db.get<{ count: number }>(`SELECT COUNT(*) as count FROM ${table}`)?.count || 0;
  const thisYear =
    db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${table} WHERE created_at >= ?`,
      `${year}-01-01`,
    )?.count || 0;

  // Rating distribution for modules with ratings
  let ratingDist: { rating: number; count: number }[] = [];
  if (['foods', 'media', 'games', 'books'].includes(table)) {
    ratingDist = db.all(
      `SELECT rating, COUNT(*) as count FROM ${table} WHERE rating IS NOT NULL GROUP BY rating ORDER BY rating`,
    );
  }

  // Monthly trend
  const monthlyTrend = db.all(
    `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count FROM ${table} GROUP BY month ORDER BY month DESC LIMIT 12`,
  );

  return {
    success: true,
    data: { total, thisYear, ratingDist, monthlyTrend },
  };
});
