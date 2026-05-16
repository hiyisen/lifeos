/**
 * 更新书籍API接口
 * 根据ID更新书籍的完整信息，包含数据验证和默认值处理
 */

import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  // 从URL参数中获取书籍ID
  const id = Number(getRouterParam(event, 'id'));
  // 读取请求体中的更新数据
  const body = await readBody(event);
  const db = getDb();

  // 验证书籍是否存在
  if (!db.get('SELECT id FROM books WHERE id = ?', id)) {
    throw createError({ statusCode: 404, message: 'Book not found' });
  }

  // 执行更新操作，设置默认值并更新时间戳
  db.run(
    `UPDATE books SET title=?, original_title=?, author=?, isbn=?, publisher=?, publish_year=?, price=?, series=?, type=?, rating=?, summary=?, review=?, cover_path=?, source_id=?, source_url=?, status=?, page_count=?, current_page=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    body.title,
    body.original_title || null,
    body.author || null,
    body.isbn || null,
    body.publisher || null,
    body.publish_year || null,
    body.price || null,
    body.series || null,
    body.type || 'paper', // 默认类型为纸质书
    body.rating || null,
    body.summary || null,
    body.review || null,
    body.cover_path || null,
    body.source_id || null,
    body.source_url || null,
    body.status || 'wishlist', // 默认状态为想读
    body.page_count || null,
    body.current_page || 0, // 默认当前页数为0
    id,
  );
  // 返回更新后的书籍详情
  return { success: true, data: db.get('SELECT * FROM books WHERE id = ?', id) };
});
