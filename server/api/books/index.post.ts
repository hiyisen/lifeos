/**
 * 创建书籍API接口
 * 处理新书籍的创建请求，包含必要的数据验证
 */

import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  // 读取并解析请求体
  const body = await readBody<{
    title: string; // 书名（必填）
    original_title?: string; // 原名
    author?: string; // 作者
    isbn?: string; // ISBN
    publisher?: string; // 出版社
    publish_year?: number; // 出版年份
    price?: string; // 价格
    series?: string; // 丛书
    type?: string; // 类型（paper/ebook/audio，默认paper）
    rating?: number; // 评分
    summary?: string; // 简介
    review?: string; // 个人评论
    cover_path?: string; // 封面图片路径
    source_id?: string; // 来源ID（如豆瓣ID）
    source_url?: string; // 来源URL
    status?: string; // 状态（wishlist/reading/finished，默认wishlist）
    page_count?: number; // 总页数
    current_page?: number; // 当前阅读页数
  }>(event);

  // 验证必填字段
  if (!body.title) throw createError({ statusCode: 400, message: 'title is required' });

  const db = getDb();
  // 插入新书籍记录，设置默认值和空值处理
  const result = db.run(
    `INSERT INTO books (title, original_title, author, isbn, publisher, publish_year, price, series, type, rating, summary, review, cover_path, source_id, source_url, status, page_count, current_page)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  );

  // 返回创建成功的书籍详情
  return {
    success: true,
    data: db.get('SELECT * FROM books WHERE id = ?', result.lastInsertRowid),
  };
});
