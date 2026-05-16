/**
 * 仪表盘统计API接口
 * 提供首页仪表盘所需的各种统计数据
 * 包括周新增数据、财务汇总、进行中项目、最近活动和高分推荐
 */

import { getDb } from '../../utils/db';

export default defineEventHandler(() => {
  const db = getDb();
  // 获取今天的日期（YYYY-MM-DD格式）
  const today = new Date().toISOString().split('T')[0];
  // 获取一周前的日期
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  // 计算本周新增的各项记录数量
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

  // 计算本周的收支金额
  const weekExpense = db.get<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE type = 'expense' AND created_at >= ?`,
    weekAgo,
  );
  const weekIncome = db.get<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE type = 'income' AND created_at >= ?`,
    weekAgo,
  );

  // 获取进行中的项目（按模块分类）
  const inProgressItems = {
    // 正在观看的媒体
    media: db.all(
      "SELECT id, title, status FROM media WHERE status IN ('watching') ORDER BY updated_at DESC LIMIT 5",
    ),
    // 正在玩的游戏
    games: db.all(
      "SELECT id, title, status FROM games WHERE status = 'playing' ORDER BY updated_at DESC LIMIT 5",
    ),
    // 正在阅读的书籍
    books: db.all(
      "SELECT id, title, status FROM books WHERE status = 'reading' ORDER BY updated_at DESC LIMIT 5",
    ),
    // 即将到期的任务（今天或之前到期且未完成）
    tasks: db.all(
      "SELECT id, title, priority, due_date FROM tasks WHERE status != 'done' AND due_date <= ? ORDER BY priority, due_date LIMIT 10",
      today,
    ),
  };

  // 获取最近的活动记录（跨模块合并）
  const recentActivity = db.all(
    `SELECT 'food' as module, name as title, created_at FROM foods
     UNION ALL SELECT 'media', title, created_at FROM media
     UNION ALL SELECT 'game', title, created_at FROM games
     UNION ALL SELECT 'book', title, created_at FROM books
     ORDER BY created_at DESC LIMIT 10`,
  );

  // 获取各模块的高分推荐（评分最高的前3个）
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

  // 返回完整的仪表盘统计数据
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
