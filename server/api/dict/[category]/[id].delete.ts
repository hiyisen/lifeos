import { deleteCustomDictItem } from '../../../utils/dict';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id) throw createError({ statusCode: 400, message: 'id is required' });

  const deleted = deleteCustomDictItem(id);
  if (!deleted) {
    throw createError({
      statusCode: 400,
      message: 'cannot delete built-in item or item not found',
    });
  }

  return { success: true, data: null };
});
