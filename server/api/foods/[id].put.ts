import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id) throw createError({ statusCode: 400, message: 'id is required' });

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

  const db = getDb();
  const existing = db.get('SELECT * FROM foods WHERE id = ?', id);
  if (!existing) throw createError({ statusCode: 404, message: 'Food not found' });

  db.run(
    `UPDATE foods SET name=?, restaurant=?, cuisine_tag=?, address=?, rating=?, price=?, photo_paths=?, note=?, visited_at=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`,
    body.name,
    body.restaurant || null,
    body.cuisine_tag || null,
    body.address || null,
    body.rating || null,
    body.price || null,
    body.photo_paths ? JSON.stringify(body.photo_paths) : null,
    body.note || null,
    body.visited_at,
    id,
  );

  const food = db.get('SELECT * FROM foods WHERE id = ?', id);
  if (food && food.photo_paths) {
    try {
      food.photo_paths = JSON.parse(food.photo_paths as string);
    } catch {
      food.photo_paths = [];
    }
  }

  return { success: true, data: food };
});
