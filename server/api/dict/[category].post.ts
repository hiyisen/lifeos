/**
 * 创建自定义字典条目API接口
 * 允许用户为指定字典类别添加自定义选项
 * 注意：只能添加自定义条目，不能修改内置条目
 */

import { addCustomDictItem } from '../../utils/dict';

export default defineEventHandler(async (event) => {
  // 从URL参数中获取字典类别编码
  const category = getRouterParam(event, 'category');
  if (!category) throw createError({ statusCode: 400, message: 'category is required' });

  // 读取请求体中的新条目数据
  const body = await readBody<{ code: string; label: string; color?: string }>(event);
  // 验证必填字段
  if (!body.code || !body.label) {
    throw createError({ statusCode: 400, message: 'code and label are required' });
  }

  // 尝试添加自定义字典条目
  const item = addCustomDictItem(category, body.code, body.label, body.color);
  // 如果类别不存在，返回404错误
  if (!item) throw createError({ statusCode: 404, message: 'category not found' });

  // 返回创建成功的字典条目
  return { success: true, data: item };
});
