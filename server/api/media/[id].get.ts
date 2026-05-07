import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const media = getDb().get('SELECT * FROM media WHERE id = ?', id);
  if (!media) throw createError({ statusCode: 404, message: 'Media not found' });
  return { success: true, data: media };
});
