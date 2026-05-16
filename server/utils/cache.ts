/**
 * 搜索结果缓存工具模块
 * 提供基于数据库的搜索结果缓存功能
 * 缓存有效期为1天，避免重复请求外部API
 */

import { getDb } from './db';

/**
 * 检查搜索缓存是否存在有效结果
 * 查询指定来源和关键词的缓存数据，仅返回24小时内创建的缓存
 * @param source 缓存来源标识（如'douban-media', 'douban-books'等）
 * @param query 搜索关键词
 * @returns 缓存的JSON字符串结果，如果不存在或已过期则返回null
 */
export function checkSearchCache(source: string, query: string): string | null {
  const db = getDb();
  const row = db.get<{ results: string }>(
    `SELECT results FROM search_cache
     WHERE source = ? AND query = ? AND created_at > datetime('now', '-1 day')`,
    source,
    query.toLowerCase().trim(),
  );
  return row ? row.results : null;
}

/**
 * 缓存搜索结果
 * 将搜索结果存储到数据库中，使用INSERT OR REPLACE确保相同查询的缓存被更新
 * @param source 缓存来源标识
 * @param query 搜索关键词
 * @param results 要缓存的搜索结果对象
 */
export function cacheSearchResult(source: string, query: string, results: unknown): void {
  const db = getDb();
  db.run(
    `INSERT OR REPLACE INTO search_cache (source, query, results, created_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    source,
    query.toLowerCase().trim(),
    JSON.stringify(results),
  );
}
