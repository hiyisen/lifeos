import { getDb } from '../../utils/db';

export default defineEventHandler(() => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const weekFoods = db.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM foods WHERE created_at >= ?',
    weekAgo,
  );
  const weekMedia = db.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM media WHERE created_at >= ?',
    weekAgo,
  );
  const weekGames = db.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM games WHERE created_at >= ?',
    weekAgo,
  );
  const weekBooks = db.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM books WHERE created_at >= ?',
    weekAgo,
  );

  const weekExpense = db.get<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE type = 'expense' AND created_at >= ?`,
    weekAgo,
  );
  const weekIncome = db.get<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE type = 'income' AND created_at >= ?`,
    weekAgo,
  );

  const inProgressItems = {
    media: db.all(
      "SELECT id, title, status FROM media WHERE status IN ('watching') ORDER BY updated_at DESC LIMIT 5",
    ),
    games: db.all(
      "SELECT id, title, status FROM games WHERE status = 'playing' ORDER BY updated_at DESC LIMIT 5",
    ),
    books: db.all(
      "SELECT id, title, status FROM books WHERE status = 'reading' ORDER BY updated_at DESC LIMIT 5",
    ),
    tasks: db.all(
      "SELECT id, title, priority, due_date FROM tasks WHERE status != 'done' AND due_date <= ? ORDER BY priority, due_date LIMIT 10",
      today,
    ),
  };

  const recentActivity = db.all(
    `SELECT 'food' as module, name as title, created_at FROM foods
     UNION ALL SELECT 'media', title, created_at FROM media
     UNION ALL SELECT 'game', title, created_at FROM games
     UNION ALL SELECT 'book', title, created_at FROM books
     ORDER BY created_at DESC LIMIT 10`,
  );

  const topRated = {
    foods: db.all(
      'SELECT id, name, rating FROM foods WHERE rating IS NOT NULL ORDER BY rating DESC LIMIT 3',
    ),
    media: db.all(
      'SELECT id, title, rating FROM media WHERE rating IS NOT NULL ORDER BY rating DESC LIMIT 3',
    ),
    games: db.all(
      'SELECT id, title, rating FROM games WHERE rating IS NOT NULL ORDER BY rating DESC LIMIT 3',
    ),
    books: db.all(
      'SELECT id, title, rating FROM books WHERE rating IS NOT NULL ORDER BY rating DESC LIMIT 3',
    ),
  };

  return {
    success: true,
    data: {
      weeklyNew: {
        foods: weekFoods?.count || 0,
        media: weekMedia?.count || 0,
        games: weekGames?.count || 0,
        books: weekBooks?.count || 0,
      },
      weeklyFinance: {
        expense: weekExpense?.total || 0,
        income: weekIncome?.total || 0,
      },
      inProgress: inProgressItems,
      recentActivity,
      topRated,
    },
  };
});
