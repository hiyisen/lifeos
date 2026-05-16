/**
 * 获取指定字典类别条目API接口
 * 根据字典类别编码返回该类别下的所有条目
 */

import { getDictItems } from '../../utils/dict';

export default defineEventHandler((event) => {
  // 从URL参数中获取字典类别编码
  const category = getRouterParam(event, 'category');
  // 验证类别参数是否提供
  if (!category) throw createError({ statusCode: 400, message: 'category is required' });
  // 获取指定类别的所有字典条目
  const items = getDictItems(category);
  // 返回成功的响应和字典条目数据
  return { success: true, data: items };
});
