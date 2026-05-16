/**
 * 数据库初始化插件
 * 在应用启动时创建必要的数据库表结构并填充初始数据
 * 包含字典表、业务表和缓存表的定义
 */

import { getDb } from '../utils/db';

export default defineNitroPlugin(() => {
  const db = getDb();

  // ============================================
  // 字典表结构
  // ============================================

  /**
   * 字典类别表
   * 存储不同类型的字典分类（如菜系、媒体类型等）
   */
  db.run(`CREATE TABLE IF NOT EXISTS dict_categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,  -- 类别ID
    code  TEXT NOT NULL UNIQUE,              -- 类别编码（唯一标识）
    name  TEXT NOT NULL                      -- 类别名称
  )`);

  /**
   * 字典条目表
   * 存储具体的字典选项值
   */
  db.run(`CREATE TABLE IF NOT EXISTS dict_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,  -- 条目ID
    category_id INTEGER NOT NULL REFERENCES dict_categories(id), -- 所属类别ID
    code        TEXT NOT NULL,                    -- 条目编码
    label       TEXT NOT NULL,                    -- 显示标签
    color       TEXT,                             -- 颜色标识（用于UI）
    icon        TEXT,                             -- 图标标识
    sort_order  INTEGER DEFAULT 0,                -- 排序序号
    is_builtin  INTEGER DEFAULT 1,                -- 是否为内置条目（1=是，0=否）
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    UNIQUE(category_id, code)                     -- 确保同一类别下编码唯一
  )`);

  // ============================================
  // 业务表结构
  // ============================================

  /**
   * 美食记录表
   * 存储用户品尝过的餐厅和菜品信息
   */
  db.run(`CREATE TABLE IF NOT EXISTS foods (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,                    -- 菜品/餐厅名称
    restaurant  TEXT,                             -- 餐厅名称
    cuisine_tag TEXT,                             -- 菜系标签（关联字典）
    address     TEXT,                             -- 地址
    rating      INTEGER CHECK(rating BETWEEN 1 AND 10), -- 评分（1-10分）
    price       REAL,                             -- 价格
    photo_paths TEXT,                             -- 照片路径（JSON数组字符串）
    note        TEXT,                             -- 备注
    visited_at  DATE NOT NULL,                    -- 就餐日期
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  /**
   * 媒体记录表
   * 存储电影、电视剧、动漫等媒体信息
   */
  db.run(`CREATE TABLE IF NOT EXISTS media (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,                -- 标题
    type            TEXT NOT NULL,                -- 类型（movie/tv/anime等，关联字典）
    year            INTEGER,                      -- 年份
    director        TEXT,                         -- 导演
    rating          INTEGER CHECK(rating BETWEEN 1 AND 10), -- 评分
    review          TEXT,                         -- 个人评论
    poster_path     TEXT,                         -- 海报路径
    source_id       TEXT,                         -- 来源ID（如豆瓣ID）
    source_url      TEXT,                         -- 来源URL
    status          TEXT DEFAULT 'wishlist',      -- 状态（想看/在看/已看等）
    current_season  INTEGER DEFAULT 1,            -- 当前季数
    current_episode INTEGER DEFAULT 0,            -- 当前集数
    total_episodes  INTEGER,                      -- 总集数
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  /**
   * 游戏记录表
   * 存储游戏相关信息
   */
  db.run(`CREATE TABLE IF NOT EXISTS games (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,                    -- 游戏标题
    platform    TEXT NOT NULL,                    -- 平台（PC/PS5/Switch等）
    genre       TEXT,                             -- 游戏类型
    rating      INTEGER CHECK(rating BETWEEN 1 AND 10), -- 评分
    review      TEXT,                             -- 个人评论
    cover_path  TEXT,                             -- 封面图片路径
    source_id   TEXT,                             -- 来源ID
    source_url  TEXT,                             -- 来源URL
    status      TEXT DEFAULT 'wishlist',          -- 状态（想玩/在玩/已通关等）
    play_hours  REAL DEFAULT 0,                   -- 游玩时长（小时）
    year        INTEGER,                          -- 发行年份
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  /**
   * 书籍记录表
   * 存储书籍相关信息
   */
  db.run(`CREATE TABLE IF NOT EXISTS books (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,                  -- 书名
    author        TEXT,                           -- 作者
    isbn          TEXT,                           -- ISBN
    type          TEXT DEFAULT 'paper',           -- 类型（纸质书/电子书/有声书）
    rating        INTEGER CHECK(rating BETWEEN 1 AND 10), -- 评分
    review        TEXT,                           -- 个人评论
    cover_path    TEXT,                           -- 封面图片路径
    source_id     TEXT,                           -- 来源ID（如豆瓣ID）
    source_url    TEXT,                           -- 来源URL
    status        TEXT DEFAULT 'wishlist',        -- 状态（想读/在读/已读等）
    page_count    INTEGER,                        -- 总页数
    current_page  INTEGER DEFAULT 0,              -- 当前阅读页数
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  /**
   * 记账记录表
   * 存储收支记录
   */
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    amount         REAL NOT NULL,                  -- 金额
    category       TEXT NOT NULL,                  -- 分类（餐饮/交通/购物等）
    type           TEXT DEFAULT 'expense' CHECK(type IN ('expense','income')), -- 类型（支出/收入）
    payment_method TEXT,                           -- 支付方式
    note           TEXT,                           -- 备注
    record_date    DATE NOT NULL,                  -- 记录日期
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  /**
   * 任务记录表
   * 存储待办任务信息
   */
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,                  -- 任务标题
    description   TEXT,                           -- 任务描述
    priority      TEXT DEFAULT 'medium' CHECK(priority IN ('high','medium','low')), -- 优先级
    status        TEXT DEFAULT 'todo' CHECK(status IN ('todo','in_progress','done')), -- 状态
    category      TEXT,                           -- 分类
    due_date      DATE,                           -- 截止日期
    is_recurring  INTEGER DEFAULT 0,              -- 是否重复任务
    recur_type    TEXT CHECK(recur_type IN ('daily','weekly','monthly')), -- 重复类型
    linked_module TEXT,                           -- 关联模块（foods/media/games等）
    linked_id     INTEGER,                        -- 关联记录ID
    completed_at  DATETIME,                       -- 完成时间
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ============================================
  // 搜索缓存表
  // ============================================

  /**
   * 搜索结果缓存表
   * 缓存外部API（如豆瓣）的搜索结果，避免重复请求
   */
  db.run(`CREATE TABLE IF NOT EXISTS search_cache (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source      TEXT NOT NULL,                    -- 缓存来源（如douban-media）
    query       TEXT NOT NULL,                    -- 搜索关键词
    results     TEXT NOT NULL,                    -- 缓存结果（JSON字符串）
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // 为缓存查询创建索引以提高性能
  db.run(`CREATE INDEX IF NOT EXISTS idx_search_cache_lookup ON search_cache(source, query)`);

  // ============================================
  // 初始化字典类别
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

  // 插入字典类别（如果不存在）
  for (const c of categories) {
    db.run('INSERT OR IGNORE INTO dict_categories (code, name) VALUES (?, ?)', c.code, c.name);
  }

  // ============================================
  // 初始化字典条目
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

  // 插入字典条目（如果不存在），标记为内置条目
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
