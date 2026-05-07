import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

let _db: Database.Database | null = null;

function ensureDb(): Database.Database {
  if (_db) return _db;
  const dbPath = resolve(process.env.NUXT_DB_PATH || './data/lifeos.db');
  const dir = dirname(dbPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  return _db;
}

export function getDb() {
  const d = ensureDb();
  return {
    run: (sql: string, ...params: unknown[]) => d.prepare(sql).run(...params),
    all: <T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] =>
      d.prepare(sql).all(...params) as T[],
    get: <T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined =>
      d.prepare(sql).get(...params) as T | undefined,
  };
}
