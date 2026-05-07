import { getDb } from './db';

export interface DictItem {
  id: number;
  category_id: number;
  code: string;
  label: string;
  color: string | null;
  icon: string | null;
  sort_order: number;
  is_builtin: number;
}

export interface DictCategory {
  id: number;
  code: string;
  name: string;
  items: DictItem[];
}

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

export function validateDictItem(category: string, code: string): boolean {
  return !!getDictItem(category, code);
}

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

export function deleteCustomDictItem(id: number): boolean {
  const db = getDb();
  const item = db.get<DictItem>('SELECT * FROM dict_items WHERE id = ?', id);
  if (!item || item.is_builtin === 1) return false;
  db.run('DELETE FROM dict_items WHERE id = ?', id);
  return true;
}
