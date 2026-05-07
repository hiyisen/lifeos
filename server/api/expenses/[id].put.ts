import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);
  const db = getDb();

  if (!db.get('SELECT id FROM expenses WHERE id = ?', id)) {
    throw createError({ statusCode: 404, message: 'Expense not found' });
  }

  db.run(
    `UPDATE expenses SET amount=?, category=?, type=?, payment_method=?, note=?, record_date=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    body.amount,
    body.category,
    body.type || 'expense',
    body.payment_method || null,
    body.note || null,
    body.record_date,
    id,
  );
  return { success: true, data: db.get('SELECT * FROM expenses WHERE id = ?', id) };
});
