import { getDb } from './db';

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
