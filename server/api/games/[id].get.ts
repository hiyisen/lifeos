import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const game = getDb().get('SELECT * FROM games WHERE id = ?', id);
  if (!game) throw createError({ statusCode: 404, message: 'Game not found' });
  return { success: true, data: game };
});
