import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    title: string;
    author?: string;
    isbn?: string;
    type?: string;
    rating?: number;
    review?: string;
    cover_path?: string;
    source_id?: string;
    source_url?: string;
    status?: string;
    page_count?: number;
    current_page?: number;
  }>(event);

  if (!body.title) throw createError({ statusCode: 400, message: 'title is required' });

  const db = getDb();
  const result = db.run(
    `INSERT INTO books (title, author, isbn, type, rating, review, cover_path, source_id, source_url, status, page_count, current_page)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    body.title,
    body.author || null,
    body.isbn || null,
    body.type || 'paper',
    body.rating || null,
    body.review || null,
    body.cover_path || null,
    body.source_id || null,
    body.source_url || null,
    body.status || 'wishlist',
    body.page_count || null,
    body.current_page || 0,
  );
  return {
    success: true,
    data: db.get('SELECT * FROM books WHERE id = ?', result.lastInsertRowid),
  };
});
