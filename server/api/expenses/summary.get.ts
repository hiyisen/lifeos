/**
 * 获取支出汇总统计API接口
 * 提供指定月份的收支汇总、分类统计和每日支出数据
 */

import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  // 获取查询参数（年份和月份）
  const query = getQuery(event);
  const db = getDb();

  // 设置默认查询时间（当前年月）
  const year = Number(query.year) || new Date().getFullYear();
  const month = Number(query.month) || new Date().getMonth() + 1;
  const prefix = `${year}-${String(month).padStart(2, '0')}`;

  // 计算该月总支出金额
  const totalExpense =
    db.get<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE type = 'expense' AND record_date LIKE ?`,
      `${prefix}%`,
    )?.total ?? 0;

  // 计算该月总收入金额
  const totalIncome =
    db.get<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE type = 'income' AND record_date LIKE ?`,
      `${prefix}%`,
    )?.total ?? 0;

  // 按分类统计支出金额（仅支出类型）
  const byCategory = db.all<{ category: string; amount: number }>(
    `SELECT category, COALESCE(SUM(amount), 0) as amount FROM expenses WHERE type = 'expense' AND record_date LIKE ? GROUP BY category ORDER BY amount DESC`,
    `${prefix}%`,
  );

  // 按日期统计每日支出金额
  const dailyExpenses = db.all<{ date: string; amount: number }>(
    `SELECT record_date as date, COALESCE(SUM(amount), 0) as amount FROM expenses WHERE type = 'expense' AND record_date LIKE ? GROUP BY record_date ORDER BY record_date`,
    `${prefix}%`,
  );

  // 返回完整的月度财务统计数据
  return {
    success: true,
    data: { totalExpense, totalIncome, net: totalIncome - totalExpense, byCategory, dailyExpenses },
  };
});
