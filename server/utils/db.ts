/**
 * 数据库工具模块
 * 提供SQLite数据库的连接管理和基本操作封装
 * 使用better-sqlite3作为底层数据库驱动
 */

import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

// 全局数据库实例，避免重复创建连接
let _db: Database.Database | null = null;

/**
 * 确保数据库实例存在并正确初始化
 * 如果数据库不存在则创建，并设置必要的PRAGMA配置
 * @returns 初始化好的Database实例
 */
function ensureDb(): Database.Database {
  if (_db) return _db;
  const dbPath = resolve(process.env.NUXT_DB_PATH || './data/lifeos.db');
  const dir = dirname(dbPath);
  // 确保数据库目录存在
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  _db = new Database(dbPath);
  // 启用WAL模式以提高并发性能
  _db.pragma('journal_mode = WAL');
  // 启用外键约束
  _db.pragma('foreign_keys = ON');
  return _db;
}

/**
 * 获取数据库操作接口
 * 封装了常用的SQL操作方法，提供类型安全的查询接口
 * @returns 包含run、all、get三个方法的数据库操作对象
 */
export function getDb() {
  const d = ensureDb();
  return {
    /**
     * 执行不返回结果集的SQL语句（如INSERT、UPDATE、DELETE）
     * @param sql SQL语句
     * @param params 参数数组
     * @returns 执行结果
     */
    run: (sql: string, ...params: unknown[]) => d.prepare(sql).run(...params),
    /**
     * 执行返回多行结果的SQL查询
     * @param sql SQL查询语句
     * @param params 参数数组
     * @returns 查询结果数组
     */
    all: <T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] =>
      d.prepare(sql).all(...params) as T[],
    /**
     * 执行返回单行结果的SQL查询
     * @param sql SQL查询语句
     * @param params 参数数组
     * @returns 单行查询结果或undefined
     */
    get: <T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined =>
      d.prepare(sql).get(...params) as T | undefined,
  };
}
