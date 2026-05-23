/**
 * 获取书籍列表API接口
 * 支持多种查询条件和分页功能
 */

import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  // 获取查询参数
  const query = getQuery(event);
  const db = getDb();

  // 构建基础SQL查询语句
  let sql = 'SELECT * FROM books WHERE 1=1';
  const params: unknown[] = [];

  // 根据查询参数动态添加WHERE条件
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
    // 支持按标题或作者搜索
    sql += ' AND (title LIKE ? OR author LIKE ?)';
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  // 计算总记录数用于分页
  const { total } = db.get<{ total: number }>(
    sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
    ...params,
  ) ?? { total: 0 };

  // 处理分页参数，设置默认值和边界限制
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Number(query.limit) || 20);

  const sort = String(query.sort || 'created_at');
  switch (sort) {
    case 'rating':
      sql += ' ORDER BY rating DESC NULLS LAST, created_at DESC';
      break;
    default:
      sql += ' ORDER BY created_at DESC';
  }
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  // 返回包含数据、分页信息的成功响应
  return { success: true, data: db.all(sql, ...params), meta: { total, page, pageSize: limit } };
});
