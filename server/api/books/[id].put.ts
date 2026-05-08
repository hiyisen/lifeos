import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);
  const db = getDb();

  if (!db.get('SELECT id FROM books WHERE id = ?', id)) {
    throw createError({ statusCode: 404, message: 'Book not found' });
  }

  db.run(
    `UPDATE books SET title=?, original_title=?, author=?, isbn=?, publisher=?, publish_year=?, price=?, series=?, type=?, rating=?, summary=?, review=?, cover_path=?, source_id=?, source_url=?, status=?, page_count=?, current_page=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    body.title,
    body.original_title || null,
    body.author || null,
    body.isbn || null,
    body.publisher || null,
    body.publish_year || null,
    body.price || null,
    body.series || null,
    body.type || 'paper',
    body.rating || null,
    body.summary || null,
    body.review || null,
    body.cover_path || null,
    body.source_id || null,
    body.source_url || null,
    body.status || 'wishlist',
    body.page_count || null,
    body.current_page || 0,
    id,
  );
  return { success: true, data: db.get('SELECT * FROM books WHERE id = ?', id) };
});
