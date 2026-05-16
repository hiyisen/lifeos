/**
 * 数据导出API接口
 * 支持按模块或全部数据导出，支持JSON和CSV格式
 */

import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  // 获取要导出的模块名称（foods/media/games/books/expenses/tasks/all）
  const module = getRouterParam(event, 'module') || 'all';
  const query = getQuery(event);
  // 获取导出格式（json/csv，默认json）
  const format = (query.format as string) || 'json';
  const db = getDb();

  // 支持导出的业务表列表
  const tables = ['foods', 'media', 'games', 'books', 'expenses', 'tasks'];
  let data: Record<string, unknown[]>;

  if (module === 'all') {
    // 导出全部数据，包括所有业务表和字典表
    data = {};
    for (const t of tables) {
      data[t] = db.all(`SELECT * FROM ${t}`);
    }
    data.dict_categories = db.all('SELECT * FROM dict_categories');
    data.dict_items = db.all('SELECT * FROM dict_items');
  } else {
    // 验证模块名称是否有效
    if (!tables.includes(module)) throw createError({ statusCode: 400, message: 'Invalid module' });
    // 导出指定模块的数据
    data = { [module]: db.all(`SELECT * FROM ${module}`) };
  }

  if (format === 'csv') {
    // CSV格式导出处理
    const allRows =
      module === 'all'
        ? Object.entries(data).flatMap(([table, rows]) =>
            rows.map((r: any) => ({ _table: table, ...r })),
          )
        : data[module];
    const csv = rowsToCsv(allRows);
    // 设置响应头，触发文件下载
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8');
    setHeader(
      event,
      'Content-Disposition',
      `attachment; filename="lifeos-${module}-${Date.now()}.csv"`,
    );
    return csv;
  }

  // JSON格式返回
  return { success: true, data };
});

/**
 * 将数据行数组转换为CSV格式字符串
 * 处理特殊字符转义和引号包裹
 * @param rows 数据行数组
 * @returns CSV格式字符串
 */
function rowsToCsv(rows: unknown[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0] as Record<string, unknown>);
  const lines = [headers.join(',')];
  for (const row of rows) {
    const vals = headers.map((h) => {
      const v = (row as Record<string, unknown>)[h];
      if (v === null || v === undefined) return '';
      const s = String(v);
      // 如果值包含逗号、引号或换行符，需要用双引号包裹并转义内部引号
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    });
    lines.push(vals.join(','));
  }
  return lines.join('\n');
}
