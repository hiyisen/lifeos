/**
 * 删除自定义字典条目API接口
 * 根据ID删除字典条目，但禁止删除内置条目
 * 保护系统预设的字典选项不被意外删除
 */

import { deleteCustomDictItem } from '../../../utils/dict';

export default defineEventHandler((event) => {
  // 从URL参数中获取字典条目ID
  const id = Number(getRouterParam(event, 'id'));
  if (!id) throw createError({ statusCode: 400, message: 'id is required' });

  // 尝试删除字典条目（仅限自定义条目）
  const deleted = deleteCustomDictItem(id);
  if (!deleted) {
    // 删除失败可能是因为条目不存在或试图删除内置条目
    throw createError({
      statusCode: 400,
      message: 'cannot delete built-in item or item not found',
    });
  }

  // 返回删除成功的响应
  return { success: true, data: null };
});
