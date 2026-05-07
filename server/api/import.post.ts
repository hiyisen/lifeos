import { getDb } from '../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, Record<string, unknown>[]>>(event);
  if (!body) throw createError({ statusCode: 400, message: 'No data provided' });

  const db = getDb();
  const tables = ['foods', 'media', 'games', 'books', 'expenses', 'tasks'];

  try {
    for (const table of tables) {
      const rows = body[table];
      if (!rows || rows.length === 0) continue;

      // Clear existing data for this table (optional: use a flag)
      const cols = Object.keys(rows[0]).filter(
        (c) => c !== 'id' && c !== 'created_at' && c !== 'updated_at',
      );
      const placeholders = cols.map(() => '?').join(', ');
      const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`;

      for (const row of rows) {
        db.run(sql, ...cols.map((c) => row[c] ?? null));
      }
    }
    return { success: true, data: { imported: true } };
  } catch (e) {
    throw createError({ statusCode: 500, message: `Import failed: ${(e as Error).message}` });
  }
});
