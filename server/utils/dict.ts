/**
 * 字典管理工具模块
 * 提供系统字典数据的查询、验证和管理功能
 * 字典分为类别和条目，支持内置和自定义条目
 */

import { getDb } from './db';

/**
 * 字典条目数据结构
 */
export interface DictItem {
  id: number; // 条目ID
  category_id: number; // 所属类别ID
  code: string; // 条目编码（唯一标识）
  label: string; // 显示标签
  color: string | null; // 颜色标识（用于UI显示）
  icon: string | null; // 图标标识
  sort_order: number; // 排序序号
  is_builtin: number; // 是否为内置条目（1=是，0=否）
}

/**
 * 字典类别数据结构
 */
export interface DictCategory {
  id: number; // 类别ID
  code: string; // 类别编码
  name: string; // 类别名称
  items: DictItem[]; // 该类别下的所有条目
}

/**
 * 获取指定类别的所有字典条目
 * 按排序序号和ID升序排列
 * @param category 字典类别编码
 * @returns 字典条目数组
 */
export function getDictItems(category: string): DictItem[] {
  const db = getDb();
  return db.all<DictItem>(
    `SELECT di.* FROM dict_items di
     JOIN dict_categories dc ON di.category_id = dc.id
     WHERE dc.code = ?
     ORDER BY di.sort_order, di.id`,
    category,
  );
}

/**
 * 获取指定类别和编码的字典条目
 * @param category 字典类别编码
 * @param code 字典条目编码
 * @returns 字典条目对象或undefined（未找到时）
 */
export function getDictItem(category: string, code: string): DictItem | undefined {
  const db = getDb();
  return db.get<DictItem>(
    `SELECT di.* FROM dict_items di
     JOIN dict_categories dc ON di.category_id = dc.id
     WHERE dc.code = ? AND di.code = ?`,
    category,
    code,
  );
}

/**
 * 验证字典条目是否存在
 * @param category 字典类别编码
 * @param code 字典条目编码
 * @returns 存在返回true，否则返回false
 */
export function validateDictItem(category: string, code: string): boolean {
  return !!getDictItem(category, code);
}

/**
 * 获取所有字典类别及其条目
 * 用于系统初始化时加载全部字典数据
 * @returns 所有字典类别数组
 */
export function getAllDicts(): DictCategory[] {
  const db = getDb();
  const categories = db.all<{ id: number; code: string; name: string }>(
    'SELECT * FROM dict_categories ORDER BY id',
  );
  return categories.map((cat) => ({
    ...cat,
    items: db.all<DictItem>(
      'SELECT * FROM dict_items WHERE category_id = ? ORDER BY sort_order, id',
      cat.id,
    ),
  }));
}

/**
 * 添加自定义字典条目
 * 内置条目不能被修改，只能添加自定义条目
 * @param category 字典类别编码
 * @param code 条目编码
 * @param label 显示标签
 * @param color 颜色标识（可选）
 * @returns 新创建的字典条目或null（类别不存在时）
 */
export function addCustomDictItem(
  category: string,
  code: string,
  label: string,
  color?: string,
): DictItem | null {
  const db = getDb();
  const cat = db.get<{ id: number }>('SELECT id FROM dict_categories WHERE code = ?', category);
  if (!cat) return null;

  const result = db.run(
    `INSERT INTO dict_items (category_id, code, label, color, is_builtin)
     VALUES (?, ?, ?, ?, 0)`,
    cat.id,
    code,
    label,
    color || null,
  );

  return db.get<DictItem>('SELECT * FROM dict_items WHERE id = ?', result.lastInsertRowid) || null;
}

/**
 * 删除自定义字典条目
 * 内置条目不能被删除
 * @param id 字典条目ID
 * @returns 删除成功返回true，失败返回false
 */
export function deleteCustomDictItem(id: number): boolean {
  const db = getDb();
  const item = db.get<DictItem>('SELECT * FROM dict_items WHERE id = ?', id);
  if (!item || item.is_builtin === 1) return false;
  db.run('DELETE FROM dict_items WHERE id = ?', id);
  return true;
}
