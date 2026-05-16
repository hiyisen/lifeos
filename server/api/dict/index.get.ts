/**
 * 获取所有字典数据API接口
 * 返回系统中所有字典类别及其条目的完整数据结构
 * 用于前端初始化时加载全部字典配置
 */

import { getAllDicts } from '../../utils/dict';

export default defineEventHandler(() => {
  // 获取所有字典类别和条目数据
  const data = getAllDicts();
  // 返回成功的响应和完整的字典数据
  return { success: true, data };
});
