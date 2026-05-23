/**
 * 获取支出记录列表API接口
 * 支持多种查询条件（分类、类型、日期范围、搜索）和分页功能
 */

import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  // 获取查询参数
  const query = getQuery(event);
  const db = getDb();

  // 构建基础SQL查询语句
  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const params: unknown[] = [];

  // 根据查询参数动态添加WHERE条件
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
    // 支持按备注内容搜索
    sql += ' AND note LIKE ?';
    params.push(`%${query.search}%`);
  }

  // 计算总记录数用于分页
  const { total } = db.get<{ total: number }>(
    sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
    ...params,
  ) ?? { total: 0 };

  // 处理分页参数，设置默认值和边界限制
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Number(query.limit) || 20);

  const sort = String(query.sort || 'record_date');
  switch (sort) {
    case 'amount_desc':
      sql += ' ORDER BY amount DESC, created_at DESC';
      break;
    case 'amount_asc':
      sql += ' ORDER BY amount ASC, created_at DESC';
      break;
    case 'created_at':
      sql += ' ORDER BY created_at DESC';
      break;
    default:
      sql += ' ORDER BY record_date DESC, created_at DESC';
  }
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  // 返回包含数据、分页信息的成功响应
  return { success: true, data: db.all(sql, ...params), meta: { total, page, pageSize: limit } };
});
