import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const module = getRouterParam(event, 'module') || 'all';
  const query = getQuery(event);
  const format = (query.format as string) || 'json';
  const db = getDb();

  const tables = ['foods', 'media', 'games', 'books', 'expenses', 'tasks'];
  let data: Record<string, unknown[]>;

  if (module === 'all') {
    data = {};
    for (const t of tables) {
      data[t] = db.all(`SELECT * FROM ${t}`);
    }
    data.dict_categories = db.all('SELECT * FROM dict_categories');
    data.dict_items = db.all('SELECT * FROM dict_items');
  } else {
    if (!tables.includes(module)) throw createError({ statusCode: 400, message: 'Invalid module' });
    data = { [module]: db.all(`SELECT * FROM ${module}`) };
  }

  if (format === 'csv') {
    const allRows =
      module === 'all'
        ? Object.entries(data).flatMap(([table, rows]) =>
            rows.map((r: any) => ({ _table: table, ...r })),
          )
        : data[module];
    const csv = rowsToCsv(allRows);
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8');
    setHeader(
      event,
      'Content-Disposition',
      `attachment; filename="lifeos-${module}-${Date.now()}.csv"`,
    );
    return csv;
  }

  return { success: true, data };
});

function rowsToCsv(rows: unknown[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0] as Record<string, unknown>);
  const lines = [headers.join(',')];
  for (const row of rows) {
    const vals = headers.map((h) => {
      const v = (row as Record<string, unknown>)[h];
      if (v === null || v === undefined) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    });
    lines.push(vals.join(','));
  }
  return lines.join('\n');
}
