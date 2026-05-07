# LifeOS 需求分析与系统设计

## 一、产品定位

**个人生活管理系统** — 一个人的应用，记录和管理日常生活的方方面面。

- 目标用户：1 人
- 数据规模：个人级别，终身上限 ≤ 10 万条
- 使用场景：日常随手记录、周末回顾、年终统计
- 核心价值：**记录 → 回顾 → 洞察**
- 运行环境：本地开发 → 部署至 VPS/服务器

---

## 二、功能模块

### 🍜 美食记录
```
记录吃过的餐厅、菜品、外卖，建立个人美食地图。

核心功能：
  1. 添加记录：餐厅名、菜品名、照片、评分(1-10)、人均、菜系标签、地址、就餐日期
  2. 浏览列表：卡片流 + 照片墙，支持按菜系、评分、日期筛选和排序
  3. 详情页：大图展示、地图位置
  4. 统计：菜系分布、月度消费、评分分布、常去榜单

特色：
  - 照片墙展示（好看的菜值得炫耀）
  - 快速记录模式（拍张照 + 评分就够了）
  - 菜系标签从字典表选择，支持自定义
```

### 🎬 媒体库
```
统一管理电影、电视剧、动漫、纪录片、综艺。

核心功能：
  1. 添加条目：搜索影片 → 自动补全封面/年份/导演 → 补全后仍可手动修改
  2. 类型：电影/电视剧/动漫/纪录片/综艺
  3. 状态：想看 → 在看 → 已看 → 弃了
  4. 剧集特有：当前进度（第几季第几集）、总集数
  5. 评分(1-10)、短评
  6. 统计：类型分布、评分分布、年度观影量

自动补全：接入 TMDB / Douban API，输入关键词搜索 → 选中 → 自动填充
```

### 🎮 游戏库
```
记录玩过的电子游戏，管理游戏清单。

核心功能：
  1. 添加条目：搜索游戏名 → 自动补全封面/年份/类型
  2. 状态：想玩/在玩/已通关/弃了/无止境(网游/肉鸽)
  3. 评分(1-10)、游玩时长、短评、封面图、发行年份
  4. 统计：平台分布、类型分布、年度时长、评分排行

自动补全：接入 IGDB / Steam API，输入关键词搜索
```

### 📚 书库
```
记录阅读轨迹。

核心功能：
  1. 添加条目：搜索书名 → 自动补全作者/封面/ISBN/页数
  2. 状态：想读/在读/已读/弃了
  3. 评分(1-10)、短评、类型(纸质/电子书/有声书)、当前进度
  4. 统计：月度阅读量、类型分布、在读 vs 已完成

自动补全：接入 Douban / OpenLibrary API
```

### 💰 记账
```
记录日常收支，了解钱花在哪。

核心功能：
  1. 记一笔：金额、分类、类型(支出/收入)、支付方式、备注、日期
  2. 月度总览：当月收支汇总、分类饼图、日趋势图
  3. 流水列表：按分类、日期范围筛选
  4. 统计：月度趋势、分类排行、消费习惯变化
  5. 快速记账：记住常用分类，一键填入

设计原则：打开到记完不超过 10 秒
分类/支付方式等从字典表读取，支持自定义
```

### ✅ 任务管理
```
管理待办事项，支持关联其他模块。

核心功能：
  1. 创建任务：标题、描述、优先级、截止日期、分类
  2. 状态：待办 → 进行中 → 已完成
  3. 看板视图：按状态分列
  4. 周期性任务：每天/每周/每月自动生成
  5. 关联记录：可绑定任意模块的条目
  6. 统计：完成率趋势、逾期统计
```

### 📊 统计仪表盘
```
首页总览，一眼掌握生活状态。

仪表盘内容：
  1. 概览卡片：本周各模块新增数量
  2. 进行中项目：在读/在看/在玩一览
  3. 月度支出环形图
  4. 最近活动时间线
  5. 今日待办 + 到期提醒
  6. 年度评分 Top 3（各模块独立）
```

### 📦 数据导出
```
支持将任意模块的数据导出，用于备份或迁移。

  1. 导出格式：JSON（完整结构化）、CSV（Excel 兼容）
  2. 导出粒度：按模块导 / 全量导出
  3. 导出范围：全部 / 按时间范围筛选
  4. 导入：支持导入之前导出的 JSON 文件
  5. 数据库文件本身也可直接复制（SQLite 单文件）
```

---

## 三、模块关系图

```
                    ┌──────────────┐
                    │   📊 统计    │ (聚合所有模块)
                    └──────┬───────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │          │           │           │          │
    ▼          ▼           ▼           ▼          ▼
 🍜美食     🎬媒体      🎮游戏     📚书籍     💰记账
    │          │           │           │          │
    └──────────┴───────────┴───────────┴──────────┘
                           │
                    ┌──────┴───────┐
                    │ ✅ 任务      │ (可关联任意模块)
                    └──────────────┘
                           │
                    ┌──────┴───────┐
                    │ 📦 导出      │ (全模块覆盖)
                    └──────────────┘

底层支撑：
    ┌──────────────────────────────────────┐
    │           📖 字典表体系              │
    │  菜系/媒体类型/平台/分类/支付方式...  │
    └──────────────────────────────────────┘
```

---

## 四、数据模型

### 4.1 字典表（lookup tables）

```sql
-- ============================================
-- 字典表 — 统一管理所有枚举值，支持 CRUD
-- ============================================

-- 字典分类
CREATE TABLE dict_categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    code  TEXT NOT NULL UNIQUE,     -- 唯一标识: cuisine_tag / media_type / platform / ...
    name  TEXT NOT NULL             -- 显示名: 菜系 / 媒体类型 / 游戏平台 / ...
);

-- 字典项
CREATE TABLE dict_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES dict_categories(id),
    code        TEXT NOT NULL,      -- 唯一标识: chuan_cai / pc / wechat / ...
    label       TEXT NOT NULL,      -- 显示文本: 川菜 / PC / 微信 / ...
    color       TEXT,               -- 前端展示色 #ef4444
    icon        TEXT,               -- 图标名 lucide:utensils-crossed
    sort_order  INTEGER DEFAULT 0,
    is_builtin  INTEGER DEFAULT 1,  -- 1=内置不可删 0=用户自定义可删
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, code)
);

-- 预置字典分类
INSERT INTO dict_categories (code, name) VALUES
    ('cuisine_tag',     '菜系'),
    ('media_type',      '媒体类型'),
    ('platform',        '游戏平台'),
    ('game_genre',      '游戏类型'),
    ('book_type',       '书籍类型'),
    ('expense_category','记账分类'),
    ('payment_method',  '支付方式'),
    ('task_category',   '任务分类'),
    ('food_tag',        '美食标签'),
    ('media_status',    '媒体状态'),
    ('game_status',     '游戏状态'),
    ('book_status',     '书籍状态');

-- 示例：菜系字典项
INSERT INTO dict_items (category_id, code, label, color, is_builtin) VALUES
    (1, 'chuan',      '川菜',   '#ef4444', 1),
    (1, 'yue',        '粤菜',   '#f59e0b', 1),
    (1, 'lu',         '鲁菜',   '#84cc16', 1),
    (1, 'su',         '苏菜',   '#06b6d4', 1),
    (1, 'xiang',      '湘菜',   '#f97316', 1),
    (1, 'ri_liao',    '日料',   '#ec4899', 1),
    (1, 'han_liao',   '韩料',   '#8b5cf6', 1),
    (1, 'xi_can',     '西餐',   '#6366f1', 1),
    (1, 'shao_kao',   '烧烤',   '#d946ef', 1),
    (1, 'huo_guo',    '火锅',   '#e11d48', 1),
    (1, 'xiao_chi',   '小吃',   '#14b8a6', 1),
    (1, 'tian_pin',   '甜品',   '#f43f5e', 1),
    (1, 'jian_kang',  '轻食',   '#22c55e', 1),
    (1, 'jia_chang',  '家常菜', '#78716c', 1);
```

### 4.2 业务表

```sql
-- ============================================
-- 1. 美食
-- ============================================
CREATE TABLE foods (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,           -- 菜品名
    restaurant  TEXT,                    -- 餐厅名
    cuisine_tag TEXT,                    -- 关联 dict_items.code (category='cuisine_tag')
    address     TEXT,                    -- 地址
    rating      INTEGER CHECK(rating BETWEEN 1 AND 10),
    price       REAL,                    -- 人均
    photo_paths TEXT,                    -- JSON 数组: ["/photos/foods/xxx.jpg", ...]
    note        TEXT,
    visited_at  DATE NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. 媒体
-- ============================================
CREATE TABLE media (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    type            TEXT NOT NULL,       -- 关联 dict_items.code (category='media_type')
    year            INTEGER,
    director        TEXT,
    rating          INTEGER CHECK(rating BETWEEN 1 AND 10),
    review          TEXT,
    poster_path     TEXT,               -- 本地路径 /photos/media/xxx.jpg
    source_id       TEXT,               -- 外部 API ID，如 tmdb:12345 / douban:12345
    source_url      TEXT,               -- 外部链接，如豆瓣页面
    status          TEXT DEFAULT 'wishlist', -- 关联 dict_items (category='media_status')
    current_season  INTEGER DEFAULT 1,
    current_episode INTEGER DEFAULT 0,
    total_episodes  INTEGER,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. 游戏
-- ============================================
CREATE TABLE games (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    platform    TEXT NOT NULL,           -- 关联 dict_items (category='platform')
    genre       TEXT,                    -- 关联 dict_items (category='game_genre')
    rating      INTEGER CHECK(rating BETWEEN 1 AND 10),
    review      TEXT,
    cover_path  TEXT,                    -- 本地路径
    source_id   TEXT,                    -- 外部 API ID: igdb:12345 / steam:12345
    source_url  TEXT,
    status      TEXT DEFAULT 'wishlist', -- 关联 dict_items (category='game_status')
    play_hours  REAL DEFAULT 0,
    year        INTEGER,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. 书籍
-- ============================================
CREATE TABLE books (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    author        TEXT,
    isbn          TEXT,
    type          TEXT DEFAULT 'paper',  -- 关联 dict_items (category='book_type')
    rating        INTEGER CHECK(rating BETWEEN 1 AND 10),
    review        TEXT,
    cover_path    TEXT,                  -- 本地路径
    source_id     TEXT,                  -- 外部 API ID: douban:12345
    source_url    TEXT,
    status        TEXT DEFAULT 'wishlist', -- 关联 dict_items (category='book_status')
    page_count    INTEGER,
    current_page  INTEGER DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. 记账
-- ============================================
CREATE TABLE expenses (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    amount         REAL NOT NULL,
    category       TEXT NOT NULL,        -- 关联 dict_items (category='expense_category')
    type           TEXT DEFAULT 'expense' CHECK(type IN ('expense','income')),
    payment_method TEXT,                 -- 关联 dict_items (category='payment_method')
    note           TEXT,
    record_date    DATE NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. 任务
-- ============================================
CREATE TABLE tasks (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    description   TEXT,
    priority      TEXT DEFAULT 'medium' CHECK(priority IN ('high','medium','low')),
    status        TEXT DEFAULT 'todo' CHECK(status IN ('todo','in_progress','done')),
    category      TEXT,                  -- 关联 dict_items (category='task_category')
    due_date      DATE,
    is_recurring  INTEGER DEFAULT 0,
    recur_type    TEXT CHECK(recur_type IN ('daily','weekly','monthly')),
    linked_module TEXT,                  -- foods/media/games/books/expenses
    linked_id     INTEGER,
    completed_at  DATETIME,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 数据模型设计要点

1. **字典表解耦** — 所有下拉选项从字典表读取，不硬编码。内置项不可删，用户可添加自定义项
2. **照片本地化** — `photo_paths` / `poster_path` / `cover_path` 存本地相对路径，统一放在 `data/photos/{module}/` 下
3. **外部溯源** — `source_id` + `source_url` 记录自动补全时的 API 来源，方便追溯
4. **评分统一 1-10** — 所有模块评分尺度一致，便于跨模块统计对比
5. **审计字段** — `created_at` + `updated_at` 每表必有

---

## 五、技术选型

| 层 | 选择 | 版本 | 理由 |
|----|------|------|------|
| 运行时 | Node.js | ≥20 LTS | 稳定长期支持 |
| 框架 | **Nuxt 3** | 3.x | Vue 3 全栈，前后端不分离，SSR + Server Routes |
| 数据库 | **SQLite** | 3 | 单文件零配置，个人数据完全够用 |
| SQL 驱动 | **better-sqlite3** | latest | 同步 API，性能极佳，Node.js 下 SQLite 最佳选择 |
| 样式 | **Tailwind CSS** | v4 | 原子化 CSS，暗色模式内置，通过 `@tailwindcss/vite` 插件集成 |
| 动画 | **GSAP + VueUse Motion** | — | 页面过渡 / 滚动动画 / 微交互 |
| 图表 | **ECharts** | 5.x | 功能最全，中文友好，暗色主题适配好 |
| 图标 | **Lucide Vue** | latest | 简洁一致，Tree-shakable |
| 表单 | 自定义 | — | 轻量，无需额外库 |
| 部署 | **Node.js 进程 + Caddy/Nginx** | — | 反向代理 + HTTPS |

### 为什么不选？

| 不选 | 原因 |
|------|------|
| Prisma | SQLite 下臃肿，better-sqlite3 + 手写 SQL 更轻更可控 |
| Nuxt UI / Naive UI | 组件库风格固定，Tailwind + 自己造反而更自由贴切 |
| MongoDB | 文档型不适合关联查询，统计数据量小不需要 |
| MySQL/PostgreSQL | 杀鸡用牛刀，SQLite 单文件数据库备份 = 复制一下 |
| 单独后端服务 | Nuxt server routes 已够用，无需额外进程 |

### 代码规范工具链

| 工具 | 用途 | 配置文件 |
|------|------|---------|
| **TypeScript** | 类型安全，所有 `.ts` / `.vue` 必经类型检查 | `tsconfig.json` |
| **ESLint** | 代码质量检查，Vue 3 + TS 规则 | `eslint.config.mjs` |
| **Prettier** | 代码格式化 + Tailwind 类名排序 | `.prettierrc` |
| **vue-tsc** | Vue 组件类型检查 | (Nuxt 集成) |
| **EditorConfig** | IDE 基础编码规范（缩进/换行/编码） | `.editorconfig` |

```bash
npm run lint         # ESLint 检查并自动修复
npm run lint:check   # ESLint 仅检查不修复
npm run format       # Prettier 格式化
npm run format:check # Prettier 仅检查
npm run typecheck    # TypeScript 类型检查
npm run check        # 一键全检 (lint + format + typecheck)
```

### VS Code 集成

- 保存时自动格式化（Prettier）
- 保存时自动修复 ESLint 问题
- 推荐插件：Prettier、ESLint、Vue (Volar)、Tailwind CSS IntelliSense

---

## 六、技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      Nuxt 3 App                         │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   Vue 3 (SSR)   │    │     server/ (Nitro)         │ │
│  │   pages/        │    │                             │ │
│  │   components/   │◄──►│  api/foods/    api/books/   │ │
│  │   composables/  │    │  api/media/    api/expenses/│ │
│  │   layouts/      │    │  api/games/    api/tasks/   │ │
│  │                 │    │  api/stats/    api/export/  │ │
│  └─────────────────┘    │  api/dict/     api/search/  │ │
│                          └──────────┬──────────────────┘ │
│                                     │                    │
│                          ┌──────────▼──────────────────┐ │
│                          │   server/utils/db.ts        │ │
│                          │   better-sqlite3 封装       │ │
│                          └──────────┬──────────────────┘ │
│                                     │                    │
│                          ┌──────────▼──────────────────┐ │
│                          │   data/                     │ │
│                          │   ├── lifeos.db  (SQLite)   │ │
│                          │   └── photos/    (本地图片)  │ │
│                          └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

外部服务 (仅在添加条目时调用):
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  TMDB    │  │  Douban  │  │  IGDB    │
    │ (影视)   │  │ (书籍)   │  │ (游戏)   │
    └──────────┘  └──────────┘  └──────────┘
```

### 数据流（以添加电影为例）

```
用户输入 "星际穿越"
   → GET /api/search/media?q=星际穿越
     → server 调用 TMDB API
       → 返回搜索结果列表
   → 用户选中一条
     → 自动填充：标题、年份、导演、封面（下载到本地 photos/）
   → 用户补充评分、短评 → POST /api/media
     → 写入 SQLite
```

---

## 七、目录结构

```
LifeOS/
├── app.vue                    # 根组件
├── nuxt.config.ts             # Nuxt 配置（含 Tailwind、SSR 等）
├── tailwind.config.ts
├── package.json
├── tsconfig.json
│
├── pages/                     # 页面（Nuxt 文件路由）
│   ├── index.vue              # 首页仪表盘
│   ├── foods/
│   │   ├── index.vue          # 美食列表
│   │   ├── add.vue            # 添加美食
│   │   └── [id].vue           # 美食详情
│   ├── media/
│   │   ├── index.vue          # 媒体库
│   │   ├── add.vue            # 添加（含搜索自动补全）
│   │   └── [id].vue           # 详情
│   ├── games/
│   ├── books/
│   ├── expenses/
│   ├── tasks/
│   └── stats/
│       └── index.vue          # 统计中心
│
├── server/                    # 后端（Nitro Server Routes）
│   ├── api/
│   │   ├── foods/
│   │   │   ├── index.get.ts   # 列表 + 筛选
│   │   │   ├── index.post.ts  # 新增
│   │   │   └── [id].get.ts   # 详情
│   │   │   └── [id].put.ts   # 更新
│   │   │   └── [id].delete.ts # 删除
│   │   ├── media/             # 同上结构
│   │   ├── games/
│   │   ├── books/
│   │   ├── expenses/
│   │   ├── tasks/
│   │   ├── stats/             # 聚合统计接口
│   │   │   ├── dashboard.get.ts
│   │   │   └── [module].get.ts
│   │   ├── dict/
│   │   │   ├── index.get.ts   # 获取全部字典
│   │   │   └── [category].get.ts  # 获取指定分类
│   │   ├── search/
│   │   │   ├── media.get.ts   # 搜索影视 (调用 TMDB)
│   │   │   ├── books.get.ts   # 搜索书籍 (调用 Douban/OpenLibrary)
│   │   │   └── games.get.ts   # 搜索游戏 (调用 IGDB)
│   │   └── export/
│   │       └── [module].get.ts # 导出 JSON/CSV
│   │
│   ├── utils/
│   │   ├── db.ts              # SQLite 连接与查询封装
│   │   ├── dict.ts            # 字典工具函数
│   │   └── photo.ts           # 照片下载与存储
│   │
│   └── services/
│       ├── tmdb.ts            # TMDB API 封装
│       ├── douban.ts          # 豆瓣 API 封装
│       └── igdb.ts            # IGDB API 封装
│
├── components/                # Vue 组件
│   ├── layout/
│   │   ├── AppSidebar.vue     # 侧边栏导航
│   │   ├── AppHeader.vue      # 顶部栏
│   │   └── ThemeToggle.vue    # 亮/暗色切换
│   ├── common/
│   │   ├── RatingStars.vue    # 评分组件 (1-10)
│   │   ├── StatusBadge.vue    # 状态标签
│   │   ├── DictSelect.vue     # 字典下拉选择器
│   │   ├── PhotoUpload.vue    # 照片上传
│   │   ├── PhotoGrid.vue      # 照片墙
│   │   ├── EmptyState.vue     # 空状态引导
│   │   ├── FabButton.vue      # 浮动操作按钮
│   │   ├── SearchInput.vue    # 搜索输入框
│   │   ├── ConfirmDialog.vue  # 确认弹窗
│   │   └── DataExport.vue     # 数据导出按钮
│   ├── dashboard/
│   │   ├── OverviewCards.vue  # 概览卡片
│   │   ├── ActivityTimeline.vue
│   │   ├── InProgressList.vue
│   │   ├── ExpenseChart.vue
│   │   └── TopRated.vue
│   ├── foods/
│   │   ├── FoodCard.vue
│   │   ├── FoodForm.vue
│   │   └── FoodDetail.vue
│   ├── media/
│   │   ├── MediaCard.vue
│   │   ├── MediaForm.vue
│   │   ├── MediaSearch.vue    # 外部搜索自动补全
│   │   └── MediaDetail.vue
│   ├── games/
│   ├── books/
│   ├── expenses/
│   │   ├── ExpenseForm.vue    # 极简记账表单
│   │   └── MonthlySummary.vue
│   └── tasks/
│       ├── TaskCard.vue
│       └── TaskKanban.vue     # 看板视图
│
├── composables/               # Vue 组合式函数
│   ├── useTheme.ts            # 主题切换逻辑
│   ├── useDict.ts             # 字典数据获取
│   ├── useApi.ts              # API 请求封装
│   ├── useExport.ts           # 导出逻辑
│   └── useSearch.ts           # 搜索自动补全
│
├── assets/
│   └── css/
│       └── main.css           # Tailwind + 全局样式 + 主题变量
│
├── data/                      # 运行时数据 (git ignore)
│   ├── lifeos.db              # SQLite 数据库文件
│   └── photos/                # 本地照片存储
│       ├── foods/
│       ├── media/
│       ├── games/
│       └── books/
│
├── server/plugins/
│   └── init-db.ts             # 启动时初始化数据库 + 字典种子数据
│
└── public/
    └── favicon.ico
```

---

## 八、UI/UX 设计

### 8.1 主题系统

```
主题模式（三态切换）：
  ┌──────────────────────────────────────┐
  │  🌙 暗色  ←→  💻 跟随系统  ←→  ☀️ 亮色 │
  └──────────────────────────────────────┘

实现：
  - Tailwind CSS v4 原生 dark mode（class 策略）
  - 首次加载检测 prefers-color-scheme
  - 用户手动切换后存入 localStorage，优先级高于系统设置
  - useTheme composable 统一管理：'light' | 'dark' | 'system'
  - 主题色基于 CSS 自定义属性，亮暗切换时无闪烁

亮色方案：
  - 背景: zinc-50 / white
  - 卡片: white + 微妙阴影
  - 文字: zinc-900 / zinc-600
  - 强调色: indigo-600

暗色方案：
  - 背景: zinc-950 / zinc-900
  - 卡片: zinc-900 + 玻璃态 (glassmorphism)
  - 文字: zinc-100 / zinc-400
  - 强调色: indigo-400
```

### 8.2 视觉风格

- **现代简约** — 大量留白，粗体标题，信息密度适中
- **玻璃态卡片** — 暗色模式下背景透出微妙模糊
- **微交互丰富** — hover 抬升、click 涟漪、focus 光环
- **评分用星星 + 数字** — 直观且有质感
- **empty state 精心设计** — 每个模块第一页是引导而非空白

### 8.3 布局

```
┌──────────────────────────────────────────────────┐
│  ┌──────────┐  ┌────────────────────────────────┐│
│  │ Sidebar  │  │        Content Area            ││
│  │          │  │                                ││
│  │ 🏠 首页  │  │                                ││
│  │ 🍜 美食  │  │                                ││
│  │ 🎬 媒体  │  │                                ││
│  │ 🎮 游戏  │  │                                ││
│  │ 📚 书籍  │  │                                ││
│  │ 💰 记账  │  │                                ││
│  │ ✅ 任务  │  │                                ││
│  │ 📊 统计  │  │                                ││
│  │          │  │                                ││
│  │ ──────── │  │                                ││
│  │ 导出数据 │  │                                ││
│  │ ──────── │  │                                ││
│  │ 🌙 主题  │  │                                ││
│  └──────────┘  └────────────────────────────────┘│
└──────────────────────────────────────────────────┘

移动端 (< 768px): 侧边栏收为底部 TabBar
┌──────────────────┐
│  Content Area    │
│                  │
├──────────────────┤
│ 🏠  🍜  🎬  🎮  + │  (5 个 Tab，"+ "展开更多)
└──────────────────┘
```

### 8.4 动画分级

```
L1 — CSS Transition (tailwind)
   按钮 hover、卡片抬升、输入框聚焦、状态切换
   开销：零

L2 — Vue Transition
   路由切换、列表增删、模态框进出
   开销：极小

L3 — GSAP / VueUse Motion
   首页数字递增、页面入场、滚动视差
   开销：中等

L4 — canvas-confetti
   完成一本书 / 通关一个游戏时触发庆祝
   开销：一次性
```

### 8.5 移动端适配

- **Mobile First** 设计，主要录入场景在手机上完成
- 桌面端展示更丰富（多列卡片、统计图表并排）
- 拍照上传：手机端直接调起相机，桌面端拖拽上传

---

## 九、API 设计

### 9.1 RESTful 规范

```
GET    /api/{module}        列表 + 筛选 + 分页
POST   /api/{module}        新增
GET    /api/{module}/:id    详情
PUT    /api/{module}/:id    更新
DELETE /api/{module}/:id    删除
```

### 9.2 核心接口清单

```
# 美食
GET    /api/foods?cuisine=&rating_min=&date_from=&date_to=&page=&limit=
POST   /api/foods
GET    /api/foods/:id
PUT    /api/foods/:id
DELETE /api/foods/:id

# 媒体 / 游戏 / 书籍（同上结构）
GET    /api/media?type=&status=&rating_min=&year=&page=&limit=
...

# 记账
GET    /api/expenses?category=&type=&date_from=&date_to=&page=&limit=
POST   /api/expenses
GET    /api/expenses/summary?year=&month=    # 月度汇总

# 任务
GET    /api/tasks?status=&priority=&category=
POST   /api/tasks
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/status          # 快速更新状态

# 搜索（外部 API 自动补全）
GET    /api/search/media?q=           # 搜索影视
GET    /api/search/books?q=           # 搜索书籍
GET    /api/search/games?q=           # 搜索游戏

# 字典
GET    /api/dict                      # 所有字典分类 + 项
GET    /api/dict/:category            # 指定分类的字典项
POST   /api/dict/:category            # 用户添加自定义字典项
DELETE /api/dict/:category/:id        # 删除用户自定义项

# 统计
GET    /api/stats/dashboard           # 首页仪表盘数据
GET    /api/stats/foods
GET    /api/stats/media
...

# 导出
GET    /api/export/:module?format=json|csv&date_from=&date_to=
GET    /api/export/all?format=json    # 全量导出
POST   /api/import                    # 导入 JSON 文件
```

### 9.3 响应格式

```typescript
// 成功
{ success: true, data: T, meta?: { total: number, page: number } }

// 失败
{ success: false, error: string, detail?: string }
```

---

## 十、外部 API 自动补全

### 10.1 服务列表

| 模块 | API | 用途 | 费用 |
|------|-----|------|------|
| 影视 | **TMDB API v3** | 搜索电影/电视剧/动漫, 获取封面/年份/简介 | 免费 |
| 书籍 | **OpenLibrary** | 搜索书籍, 获取作者/封面/ISBN | 免费 |
| 游戏 | **IGDB** (via Twitch) | 搜索游戏, 获取封面/平台/类型/简介 | 免费 |

> 豆瓣 API 已关闭公开访问，改用 OpenLibrary（书）+ TMDB（影视）。
> IGDB 需要注册 Twitch 开发者账号获取 client_id，免费额度足够个人使用。
> 所有 API Key 通过 `.env` 管理，不提交到 Git。

### 10.2 缓存策略

- 外部搜索结果缓存到 SQLite `search_cache` 表，24h 有效，减少重复调用
- 封面图片下载到本地 `data/photos/{module}/`，避免外部链接失效

---

## 十一、部署架构

```
┌────────────────────────────────────────┐
│              服务器 (VPS)              │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  Caddy / Nginx (反向代理 + HTTPS)│  │
│  └────────────┬─────────────────────┘  │
│               │ :80/:443               │
│  ┌────────────▼─────────────────────┐  │
│  │  Nuxt 3 App  (Node.js 进程)      │  │
│  │  :3000                           │  │
│  │  ├── SSR 渲染                    │  │
│  │  └── API Routes                  │  │
│  └────────────┬─────────────────────┘  │
│               │                        │
│  ┌────────────▼─────────────────────┐  │
│  │  data/                           │  │
│  │  ├── lifeos.db                   │  │
│  │  └── photos/                     │  │
│  └──────────────────────────────────┘  │
│                                        │
│  进程管理: PM2 / systemd               │
│  备份: cron 每日 rsync data/ 到备份目录 │
└────────────────────────────────────────┘
```

---

## 十二、数据库备份与导出

### 12.1 导出功能

| 格式 | 场景 |
|------|------|
| **JSON** | 完整结构保留、可重新导入、可跨系统迁移 |
| **CSV** | Excel 查看、数据分析、打印 |

### 12.2 备份策略

```
1. SQLite 文件备份 → 直接 cp lifeos.db lifeos_20260507.db
2. 照片备份 → rsync data/photos/ /backup/photos/
3. 定时备份 → cron 每日凌晨全量备份 data/ 目录
4. 导出功能 → 用户在界面点击"导出"下载 JSON/CSV
```

---

## 十三、开发阶段

### Phase 1 — 骨架 + 一个模块 MVP
```
□ Nuxt 3 初始化 + Tailwind CSS v4 + 暗色/亮色主题
□ 基础布局（侧边栏 + 内容区 + 移动端 TabBar）
□ SQLite 初始化 + 字典表种子数据
□ better-sqlite3 封装
□ 美食模块完整 CRUD + 照片上传
□ 首页骨架（空状态引导）
```

### Phase 2 — 核心内容模块
```
□ 媒体库（含 TMDB 搜索自动补全）
□ 书籍（含 OpenLibrary 搜索自动补全）
□ 游戏（含 IGDB 搜索自动补全）
```

### Phase 3 — 记账 + 任务
```
□ 记账（极简录入 + 月度汇总）
□ 任务管理（看板视图 + 周期性任务 + 模块关联）
```

### Phase 4 — 统计 + 导出 + 部署
```
□ 首页仪表盘完整版（ECharts 图表）
□ 各模块统计页
□ 数据导出（JSON + CSV）
□ 动画打磨
□ 部署文档 + 脚本
```

---

## 十四、环境变量

```bash
# .env
NUXT_PUBLIC_SITE_NAME=LifeOS
NUXT_DB_PATH=./data/lifeos.db
NUXT_PHOTOS_DIR=./data/photos

# 外部 API（可选，不配也可以手动录入）
TMDB_API_KEY=
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=

# 部署
NUXT_HOST=0.0.0.0
NUXT_PORT=3000
```

---

> 以上为完整需求分析与架构设计。确认后进入 Phase 1 编码。
