import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    amount: number;
    category: string;
    type?: 'expense' | 'income';
    payment_method?: string;
    note?: string;
    record_date: string;
  }>(event);

  if (!body.amount || !body.category || !body.record_date) {
    throw createError({
      statusCode: 400,
      message: 'amount, category and record_date are required',
    });
  }

  const db = getDb();
  const result = db.run(
    `INSERT INTO expenses (amount, category, type, payment_method, note, record_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    body.amount,
    body.category,
    body.type || 'expense',
    body.payment_method || null,
    body.note || null,
    body.record_date,
  );
  return {
    success: true,
    data: db.get('SELECT * FROM expenses WHERE id = ?', result.lastInsertRowid),
  };
});
