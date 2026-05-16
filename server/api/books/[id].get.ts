/**
 * 获取书籍详情API接口
 * 根据ID查询单本书籍的完整信息
 */

import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  // 从URL参数中获取书籍ID
  const id = Number(getRouterParam(event, 'id'));
  // 查询书籍记录
  const book = getDb().get('SELECT * FROM books WHERE id = ?', id);
  // 如果书籍不存在，返回404错误
  if (!book) throw createError({ statusCode: 404, message: 'Book not found' });
  // 返回成功的响应和书籍数据
  return { success: true, data: book };
});
