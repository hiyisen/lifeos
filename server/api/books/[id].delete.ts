/**
 * 删除书籍API接口
 * 根据ID删除书籍记录，并清理关联的封面图片文件
 */

import { getDb } from '../../utils/db';
import { deletePhoto } from '../../utils/photo';

export default defineEventHandler((event) => {
  // 从URL参数中获取书籍ID
  const id = Number(getRouterParam(event, 'id'));
  const db = getDb();
  // 先查询书籍的封面路径，用于后续文件清理
  const book = db.get<{ cover_path: string | null }>(
    'SELECT cover_path FROM books WHERE id = ?',
    id,
  );
  // 如果书籍不存在，返回404错误
  if (!book) throw createError({ statusCode: 404, message: 'Book not found' });
  // 如果存在封面图片，删除对应的物理文件
  if (book.cover_path) deletePhoto(book.cover_path);
  // 从数据库中删除书籍记录
  db.run('DELETE FROM books WHERE id = ?', id);
  // 返回删除成功的响应
  return { success: true, data: null };
});
