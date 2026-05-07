import { addCustomDictItem } from '../../utils/dict';

export default defineEventHandler(async (event) => {
  const category = getRouterParam(event, 'category');
  if (!category) throw createError({ statusCode: 400, message: 'category is required' });

  const body = await readBody<{ code: string; label: string; color?: string }>(event);
  if (!body.code || !body.label) {
    throw createError({ statusCode: 400, message: 'code and label are required' });
  }

  const item = addCustomDictItem(category, body.code, body.label, body.color);
  if (!item) throw createError({ statusCode: 404, message: 'category not found' });

  return { success: true, data: item };
});
