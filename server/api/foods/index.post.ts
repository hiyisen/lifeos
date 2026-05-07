import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name: string;
    restaurant?: string;
    cuisine_tag?: string;
    address?: string;
    rating?: number;
    price?: number;
    photo_paths?: string[];
    note?: string;
    visited_at: string;
  }>(event);

  if (!body.name || !body.visited_at) {
    throw createError({ statusCode: 400, message: 'name and visited_at are required' });
  }

  const db = getDb();
  const result = db.run(
    `INSERT INTO foods (name, restaurant, cuisine_tag, address, rating, price, photo_paths, note, visited_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    body.name,
    body.restaurant || null,
    body.cuisine_tag || null,
    body.address || null,
    body.rating || null,
    body.price || null,
    body.photo_paths ? JSON.stringify(body.photo_paths) : null,
    body.note || null,
    body.visited_at,
  );

  const food = db.get('SELECT * FROM foods WHERE id = ?', result.lastInsertRowid);
  if (food && food.photo_paths) {
    try {
      food.photo_paths = JSON.parse(food.photo_paths as string);
    } catch {
      food.photo_paths = [];
    }
  }

  return { success: true, data: food };
});
