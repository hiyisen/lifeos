import { getDictItems } from '../../utils/dict';

export default defineEventHandler((event) => {
  const category = getRouterParam(event, 'category');
  if (!category) throw createError({ statusCode: 400, message: 'category is required' });
  const items = getDictItems(category);
  return { success: true, data: items };
});
