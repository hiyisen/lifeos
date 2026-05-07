import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const db = getDb();

  const year = Number(query.year) || new Date().getFullYear();
  const month = Number(query.month) || new Date().getMonth() + 1;
  const prefix = `${year}-${String(month).padStart(2, '0')}`;

  const totalExpense =
    db.get<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE type = 'expense' AND record_date LIKE ?`,
      `${prefix}%`,
    )?.total ?? 0;

  const totalIncome =
    db.get<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE type = 'income' AND record_date LIKE ?`,
      `${prefix}%`,
    )?.total ?? 0;

  const byCategory = db.all<{ category: string; amount: number }>(
    `SELECT category, COALESCE(SUM(amount), 0) as amount FROM expenses WHERE type = 'expense' AND record_date LIKE ? GROUP BY category ORDER BY amount DESC`,
    `${prefix}%`,
  );

  const dailyExpenses = db.all<{ date: string; amount: number }>(
    `SELECT record_date as date, COALESCE(SUM(amount), 0) as amount FROM expenses WHERE type = 'expense' AND record_date LIKE ? GROUP BY record_date ORDER BY record_date`,
    `${prefix}%`,
  );

  return {
    success: true,
    data: { totalExpense, totalIncome, net: totalIncome - totalExpense, byCategory, dailyExpenses },
  };
});
