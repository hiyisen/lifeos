import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id) throw createError({ statusCode: 400, message: 'id is required' });

  const db = getDb();
  const food = db.get('SELECT * FROM foods WHERE id = ?', id);
  if (!food) throw createError({ statusCode: 404, message: 'Food not found' });

  if (food.photo_paths) {
    try {
      food.photo_paths = JSON.parse(food.photo_paths as string);
    } catch {
      food.photo_paths = [];
    }
  } else {
    food.photo_paths = [];
  }

  return { success: true, data: food };
});
