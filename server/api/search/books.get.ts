/**
 * 书籍外部搜索API接口
 * 支持从豆瓣和OpenLibrary两个数据源搜索书籍信息
 * 采用优先级策略：先尝试豆瓣，失败后回退到OpenLibrary
 */

import { searchDoubanBooks, doubanImageUrl } from '../../services/douban';
import { searchOpenLibrary, olCoverUrl } from '../../services/openlibrary';

export default defineEventHandler(async (event) => {
  // 获取搜索关键词
  const query = getQuery(event);
  const q = String(query.q || '').trim();
  // 验证搜索关键词长度（至少2个字符）
  if (q.length < 2) return { success: true, data: [] };

  // 优先尝试豆瓣搜索（中文内容更丰富）
  try {
    const doubanResults = await searchDoubanBooks(q);
    if (doubanResults.length > 0) {
      return {
        success: true,
        data: doubanResults.map((item) => ({
          source: 'douban', // 数据来源标识
          title: item.title, // 书名
          author: item.author, // 作者列表
          year: item.year, // 出版年份
          cover: doubanImageUrl(item.img), // 封面图片URL（转换为大图）
          source_id: `douban:${item.id}`, // 唯一标识（包含来源前缀）
          source_url: item.url || `https://book.douban.com/subject/${item.id}/`, // 详情页URL
        })),
      };
    }
  } catch {
    // 豆瓣搜索失败，继续尝试OpenLibrary
  }

  // 回退到OpenLibrary搜索（国际化的开放图书馆数据）
  try {
    const olResults = await searchOpenLibrary(q);
    return {
      success: true,
      data: olResults.map((item) => ({
        source: 'openlibrary',
        title: item.title,
        author: item.author_name || [],
        year: item.first_publish_year,
        cover: olCoverUrl(item.cover_i, 'M'), // 中等尺寸封面
        isbn: item.isbn?.[0], // ISBN（取第一个）
        source_id: `ol:${item.key}`,
        source_url: `https://openlibrary.org${item.key}`,
      })),
    };
  } catch {
    // 所有搜索源都失败，返回空结果
    return { success: true, data: [] };
  }
});
