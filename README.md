# LifeOS

个人生活管理系统 — 记录和管理日常生活的方方面面。美食、影视、游戏、书籍、记账、任务，一站式搞定。

## 功能模块

| 模块 | 功能 |
|------|------|
| 美食 | 记录餐厅/菜品，照片墙，菜系标签，按评分/人均/日期筛选 |
| 媒体 | 电影/电视剧/动漫/纪录片/综艺，搜索自动补全，想看→在看→已看 |
| 游戏 | 游戏库管理，平台/时长/进度追踪，支持 IGDB 搜索 |
| 书籍 | 阅读记录，搜索自动补全（豆瓣/OpenLibrary），阅读状态管理 |
| 记账 | 收支记录，分类统计，支持自定义类别 |
| 任务 | 待办事项，关联生活模块 |
| 统计 | 跨模块数据分析，评分分布，年度汇总 |

## 技术栈

- **框架**：Nuxt 3（Vue 3 全栈，SSR + Server Routes）
- **数据库**：SQLite（better-sqlite3）
- **样式**：Tailwind CSS v4，支持暗色模式
- **图表**：ECharts 5
- **动画**：GSAP + VueUse Motion
- **图标**：Lucide Vue

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 代码检查
npm run check
```

开发服务器默认运行在 `http://localhost:3000`。

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

| 变量 | 说明 | 必填 |
|------|------|------|
| `NUXT_PUBLIC_SITE_NAME` | 站点名称 | 否 |
| `NUXT_DB_PATH` | SQLite 数据库路径 | 否，默认 `./data/lifeos.db` |
| `NUXT_PHOTOS_DIR` | 照片存储目录 | 否，默认 `./data/photos` |
| `TMDB_API_KEY` | TMDB API Key（媒体搜索） | 否 |
| `IGDB_CLIENT_ID` | IGDB Client ID（游戏搜索） | 否 |
| `IGDB_CLIENT_SECRET` | IGDB Client Secret | 否 |
| `NUXT_HOST` | 部署监听地址 | 否，默认 `0.0.0.0` |
| `NUXT_PORT` | 部署监听端口 | 否，默认 `3000` |

> API Key 全部可选，不填也可手动录入数据。

## 部署

### Docker（推荐）

```bash
docker compose up -d
```

`data/` 目录挂载到宿主机，数据库和照片持久化存储。

### 直接运行

```bash
npm ci
npm run build
node .output/server/index.mjs
```

监听 `0.0.0.0:3000`，建议通过 Nginx/Caddy 反向代理 + HTTPS。

### PM2 守护

```bash
pm2 start .output/server/index.mjs --name lifeos
pm2 save && pm2 startup
```

## 目录结构

```
pages/              # Vue 页面（Nuxt 文件路由）
layouts/            # 布局组件
components/         # Vue 组件（按模块 + common/ + layout/）
composables/        # 组合式函数
server/
  api/              # REST API 路由（/api/*）
  routes/           # 原始请求处理（图片服务等）
  plugins/          # 服务端插件（DB 初始化）
  utils/            # 数据库、字典、图片等工具
  services/         # 外部搜索服务（豆瓣、TMDB、IGDB）
data/               # SQLite 数据库 + 照片（git ignored）
```

## License

MIT
