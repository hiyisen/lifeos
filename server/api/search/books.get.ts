import { searchOpenLibrary } from '../../services/openlibrary';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const q = String(query.q || '').trim();
  if (q.length < 2) return { success: true, data: [] };

  const results = await searchOpenLibrary(q);
  return { success: true, data: results };
});
