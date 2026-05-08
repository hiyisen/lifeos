export default defineNitroPlugin(() => {
  const db = getDb();

  // ============================================
  // Dictionary tables
  // ============================================
  db.run(`CREATE TABLE IF NOT EXISTS dict_categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    code  TEXT NOT NULL UNIQUE,
    name  TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS dict_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES dict_categories(id),
    code        TEXT NOT NULL,
    label       TEXT NOT NULL,
    color       TEXT,
    icon        TEXT,
    sort_order  INTEGER DEFAULT 0,
    is_builtin  INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, code)
  )`);

  // ============================================
  // Business tables
  // ============================================
  db.run(`CREATE TABLE IF NOT EXISTS foods (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    restaurant  TEXT,
    cuisine_tag TEXT,
    address     TEXT,
    rating      INTEGER CHECK(rating BETWEEN 1 AND 10),
    price       REAL,
    photo_paths TEXT,
    note        TEXT,
    visited_at  DATE NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS media (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    type            TEXT NOT NULL,
    year            INTEGER,
    director        TEXT,
    rating          INTEGER CHECK(rating BETWEEN 1 AND 10),
    review          TEXT,
    poster_path     TEXT,
    source_id       TEXT,
    source_url      TEXT,
    status          TEXT DEFAULT 'wishlist',
    current_season  INTEGER DEFAULT 1,
    current_episode INTEGER DEFAULT 0,
    total_episodes  INTEGER,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS games (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    platform    TEXT NOT NULL,
    genre       TEXT,
    rating      INTEGER CHECK(rating BETWEEN 1 AND 10),
    review      TEXT,
    cover_path  TEXT,
    source_id   TEXT,
    source_url  TEXT,
    status      TEXT DEFAULT 'wishlist',
    play_hours  REAL DEFAULT 0,
    year        INTEGER,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS books (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    author        TEXT,
    isbn          TEXT,
    type          TEXT DEFAULT 'paper',
    rating        INTEGER CHECK(rating BETWEEN 1 AND 10),
    review        TEXT,
    cover_path    TEXT,
    source_id     TEXT,
    source_url    TEXT,
    status        TEXT DEFAULT 'wishlist',
    page_count    INTEGER,
    current_page  INTEGER DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    amount         REAL NOT NULL,
    category       TEXT NOT NULL,
    type           TEXT DEFAULT 'expense' CHECK(type IN ('expense','income')),
    payment_method TEXT,
    note           TEXT,
    record_date    DATE NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    description   TEXT,
    priority      TEXT DEFAULT 'medium' CHECK(priority IN ('high','medium','low')),
    status        TEXT DEFAULT 'todo' CHECK(status IN ('todo','in_progress','done')),
    category      TEXT,
    due_date      DATE,
    is_recurring  INTEGER DEFAULT 0,
    recur_type    TEXT CHECK(recur_type IN ('daily','weekly','monthly')),
    linked_module TEXT,
    linked_id     INTEGER,
    completed_at  DATETIME,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ============================================
  // Search cache
  // ============================================
  db.run(`CREATE TABLE IF NOT EXISTS search_cache (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source      TEXT NOT NULL,
    query       TEXT NOT NULL,
    results     TEXT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_search_cache_lookup ON search_cache(source, query)`);

  // ============================================
  // Seed dict categories
  // ============================================
  const categories = [
    { code: 'cuisine_tag', name: '菜系' },
    { code: 'media_type', name: '媒体类型' },
    { code: 'platform', name: '游戏平台' },
    { code: 'game_genre', name: '游戏类型' },
    { code: 'book_type', name: '书籍类型' },
    { code: 'expense_category', name: '记账分类' },
    { code: 'payment_method', name: '支付方式' },
    { code: 'task_category', name: '任务分类' },
    { code: 'food_tag', name: '美食标签' },
    { code: 'media_status', name: '媒体状态' },
    { code: 'game_status', name: '游戏状态' },
    { code: 'book_status', name: '书籍状态' },
  ];

  for (const c of categories) {
    db.run('INSERT OR IGNORE INTO dict_categories (code, name) VALUES (?, ?)', c.code, c.name);
  }

  // ============================================
  // Seed dict items
  // ============================================
  const seedItems = [
    // cuisine_tag (category_id=1)
    { cat: 'cuisine_tag', code: 'chuan', label: '川菜', color: '#ef4444' },
    { cat: 'cuisine_tag', code: 'yue', label: '粤菜', color: '#f59e0b' },
    { cat: 'cuisine_tag', code: 'lu', label: '鲁菜', color: '#84cc16' },
    { cat: 'cuisine_tag', code: 'su', label: '融合菜', color: '#06b6d4' },
    { cat: 'cuisine_tag', code: 'xiang', label: '湘菜', color: '#f97316' },
    { cat: 'cuisine_tag', code: 'ri_liao', label: '日料', color: '#ec4899' },
    { cat: 'cuisine_tag', code: 'han_liao', label: '韩料', color: '#8b5cf6' },
    { cat: 'cuisine_tag', code: 'xi_can', label: '西餐', color: '#6366f1' },
    { cat: 'cuisine_tag', code: 'shao_kao', label: '烧烤', color: '#d946ef' },
    { cat: 'cuisine_tag', code: 'huo_guo', label: '火锅', color: '#e11d48' },
    { cat: 'cuisine_tag', code: 'xiao_chi', label: '小吃', color: '#14b8a6' },
    { cat: 'cuisine_tag', code: 'tian_pin', label: '甜品', color: '#f43f5e' },
    { cat: 'cuisine_tag', code: 'jian_kang', label: '轻食', color: '#22c55e' },
    { cat: 'cuisine_tag', code: 'jia_chang', label: '家常菜', color: '#78716c' },
    { cat: 'cuisine_tag', code: 'dong_bei', label: '东北菜', color: '#f59e0b' },
    { cat: 'cuisine_tag', code: 'nai_cha', label: '奶茶', color: '#ec4899' },
    { cat: 'cuisine_tag', code: 'jiu_ba', label: '酒吧', color: '#a855f7' },
    // media_type (category_id=2)
    { cat: 'media_type', code: 'movie', label: '电影', color: '#6366f1' },
    { cat: 'media_type', code: 'tv', label: '电视剧', color: '#8b5cf6' },
    { cat: 'media_type', code: 'anime', label: '动漫', color: '#ec4899' },
    { cat: 'media_type', code: 'documentary', label: '纪录片', color: '#22c55e' },
    { cat: 'media_type', code: 'variety', label: '综艺', color: '#f59e0b' },
    // media_status (category_id=10)
    { cat: 'media_status', code: 'wishlist', label: '想看', color: '#f59e0b' },
    { cat: 'media_status', code: 'watching', label: '在看', color: '#3b82f6' },
    { cat: 'media_status', code: 'watched', label: '已看', color: '#22c55e' },
    { cat: 'media_status', code: 'dropped', label: '弃了', color: '#9ca3af' },
    // platform (category_id=3)
    { cat: 'platform', code: 'pc', label: 'PC', color: '#6366f1' },
    { cat: 'platform', code: 'ps5', label: 'PS5', color: '#3b82f6' },
    { cat: 'platform', code: 'ps4', label: 'PS4', color: '#3b82f6' },
    { cat: 'platform', code: 'xbox', label: 'Xbox', color: '#22c55e' },
    { cat: 'platform', code: 'switch', label: 'Switch', color: '#ef4444' },
    { cat: 'platform', code: 'mobile', label: '手机', color: '#f59e0b' },
    { cat: 'platform', code: 'web', label: '网页', color: '#8b5cf6' },
    // game_genre (category_id=4)
    { cat: 'game_genre', code: 'rpg', label: 'RPG', color: '#6366f1' },
    { cat: 'game_genre', code: 'action', label: '动作', color: '#ef4444' },
    { cat: 'game_genre', code: 'adventure', label: '冒险', color: '#22c55e' },
    { cat: 'game_genre', code: 'strategy', label: '策略', color: '#f59e0b' },
    { cat: 'game_genre', code: 'simulation', label: '模拟', color: '#06b6d4' },
    { cat: 'game_genre', code: 'sports', label: '体育', color: '#84cc16' },
    { cat: 'game_genre', code: 'puzzle', label: '解谜', color: '#ec4899' },
    { cat: 'game_genre', code: 'shooter', label: '射击', color: '#f97316' },
    { cat: 'game_genre', code: 'roguelike', label: '肉鸽', color: '#a855f7' },
    { cat: 'game_genre', code: 'indie', label: '独立', color: '#14b8a6' },
    // game_status (category_id=11)
    { cat: 'game_status', code: 'wishlist', label: '想玩', color: '#f59e0b' },
    { cat: 'game_status', code: 'playing', label: '在玩', color: '#3b82f6' },
    { cat: 'game_status', code: 'completed', label: '已通关', color: '#22c55e' },
    { cat: 'game_status', code: 'dropped', label: '弃了', color: '#9ca3af' },
    { cat: 'game_status', code: 'endless', label: '无止境', color: '#a855f7' },
    // book_type (category_id=5)
    { cat: 'book_type', code: 'paper', label: '纸质书', color: '#6366f1' },
    { cat: 'book_type', code: 'ebook', label: '电子书', color: '#22c55e' },
    { cat: 'book_type', code: 'audio', label: '有声书', color: '#f59e0b' },
    // book_status (category_id=12)
    { cat: 'book_status', code: 'wishlist', label: '想读', color: '#f59e0b' },
    { cat: 'book_status', code: 'reading', label: '在读', color: '#3b82f6' },
    { cat: 'book_status', code: 'read', label: '已读', color: '#22c55e' },
    { cat: 'book_status', code: 'dropped', label: '弃了', color: '#9ca3af' },
    // expense_category (category_id=6)
    { cat: 'expense_category', code: 'food', label: '餐饮', color: '#ef4444' },
    { cat: 'expense_category', code: 'transport', label: '交通', color: '#f59e0b' },
    { cat: 'expense_category', code: 'shopping', label: '购物', color: '#8b5cf6' },
    { cat: 'expense_category', code: 'entertainment', label: '娱乐', color: '#ec4899' },
    { cat: 'expense_category', code: 'housing', label: '住房', color: '#6366f1' },
    { cat: 'expense_category', code: 'utilities', label: '水电', color: '#06b6d4' },
    { cat: 'expense_category', code: 'health', label: '医疗', color: '#22c55e' },
    { cat: 'expense_category', code: 'education', label: '学习', color: '#84cc16' },
    { cat: 'expense_category', code: 'other', label: '其他', color: '#9ca3af' },
    // payment_method (category_id=7)
    { cat: 'payment_method', code: 'cash', label: '现金', color: '#22c55e' },
    { cat: 'payment_method', code: 'wechat', label: '微信', color: '#07c160' },
    { cat: 'payment_method', code: 'alipay', label: '支付宝', color: '#1677ff' },
    { cat: 'payment_method', code: 'card', label: '银行卡', color: '#6366f1' },
    // task_category (category_id=8)
    { cat: 'task_category', code: 'work', label: '工作', color: '#6366f1' },
    { cat: 'task_category', code: 'study', label: '学习', color: '#22c55e' },
    { cat: 'task_category', code: 'life', label: '生活', color: '#f59e0b' },
    { cat: 'task_category', code: 'health', label: '健康', color: '#ef4444' },
    { cat: 'task_category', code: 'hobby', label: '兴趣', color: '#ec4899' },
    { cat: 'task_category', code: 'other', label: '其他', color: '#9ca3af' },
  ];

  for (const item of seedItems) {
    db.run(
      `INSERT OR IGNORE INTO dict_items (category_id, code, label, color, is_builtin)
       SELECT id, ?, ?, ?, 1 FROM dict_categories WHERE code = ?`,
      item.code,
      item.label,
      item.color,
      item.cat,
    );
  }
});
