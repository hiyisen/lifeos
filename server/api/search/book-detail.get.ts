import { fetchDoubanBookDetail } from '../../services/douban';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = String(query.id || '').trim();
  if (!id) return { success: false, error: 'Missing id' };

  try {
    const detail = await fetchDoubanBookDetail(id);
    if (!detail) return { success: false, error: 'Failed to fetch detail' };
    return { success: true, data: detail };
  } catch {
    return { success: false, error: 'Network error' };
  }
});
