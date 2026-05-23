import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const db = getDb();

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Number(query.limit) || 20);

  const modulesParam = String(query.modules || 'foods,media,games,books');
  const selectedModules = modulesParam
    .split(',')
    .map((m) => m.trim())
    .filter((m) => ['foods', 'media', 'games', 'books'].includes(m));

  if (selectedModules.length === 0) {
    return { success: true, data: [], meta: { total: 0, page, pageSize: limit } };
  }

  const unionParts: string[] = [];
  const params: unknown[] = [];

  for (const mod of selectedModules) {
    switch (mod) {
      case 'foods':
        unionParts.push(
          `SELECT 'foods' as module, id, name as title, COALESCE(visited_at, created_at) as date, restaurant as subtitle, NULL as image, rating FROM foods`,
        );
        break;
      case 'media':
        unionParts.push(
          `SELECT 'media' as module, id, title, COALESCE(viewed_at, created_at) as date, type as subtitle, poster_path as image, rating FROM media`,
        );
        break;
      case 'games':
        unionParts.push(
          `SELECT 'games' as module, id, title, created_at as date, platform as subtitle, cover_path as image, rating FROM games`,
        );
        break;
      case 'books':
        unionParts.push(
          `SELECT 'books' as module, id, title, created_at as date, author as subtitle, cover_path as image, rating FROM books`,
        );
        break;
    }
  }

  const unionSQL = unionParts.join(' UNION ALL ');
  const countSQL = `SELECT COUNT(*) as total FROM (${unionSQL})`;
  const { total } = db.get<{ total: number }>(countSQL, ...params) ?? { total: 0 };

  const offset = (page - 1) * limit;
  const dataSQL = `SELECT * FROM (${unionSQL}) ORDER BY date DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  return {
    success: true,
    data: db.all(dataSQL, ...params),
    meta: { total, page, pageSize: limit },
  };
});
