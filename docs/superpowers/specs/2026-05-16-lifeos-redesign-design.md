# LifeOS 全局 UI 重构设计规范

> 版本：1.0 | 日期：2026-05-16 | 基于 brainstorm 会话产出

---

## 一、设计方向

**温暖手账 · Warm Journal** — 融合三种美学的个人生活管理系统：

- **精致玻璃**：毛玻璃卡片悬浮于暖色光晕之上，层次分明
- **温暖生活**：暖棕+奶油色板，圆角亲和，像翻开的皮面手账
- **极简克制**：大量留白、信息密度低、每个页面只做一件事

---

## 二、配色系统

### 浅色模式

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-primary` | `#92400E` | 主按钮、导航高亮、强调文字 |
| `--color-on-primary` | `#FFFFFF` | 主色上文字 |
| `--color-secondary` | `#A16207` | 渐变终点、次要强调 |
| `--color-accent` | `#6366F1` | 鸢尾紫点缀、链接、徽章 |
| `--color-background` | `#FFFBEB` | 页面底色（奶油） |
| `--color-foreground` | `#0F172A` | 正文文字 |
| `--color-card` | `#FFFFFF` | 卡片底色（纯白） |
| `--color-card-foreground` | `#0F172A` | 卡片文字 |
| `--color-muted` | `#F8F3F0` | 次级背景 |
| `--color-muted-foreground` | `#64748B` | 次要文字 |
| `--color-border` | `#F1E8E2` | 边框/分割线 |
| `--color-destructive` | `#DC2626` | 删除/危险操作 |
| `--color-ring` | `#92400E` | 焦点环 |

### 深色模式

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-primary` | `#F59E0B` | 主色（琥珀） |
| `--color-accent` | `#818CF8` | 点缀（淡紫） |
| `--color-background` | `#1C1917` | 页面底色（深棕黑） |
| `--color-foreground` | `#EDEDEF` | 正文文字 |
| `--color-card` | `#292524` | 卡片底色 |
| `--color-border` | `#44403C` | 边框/分割线 |
| `--color-destructive` | `#EF4444` | 删除/危险操作 |

---

## 三、字体系统

- **标题字体**：Caveat（手写风格，仅用于页面大标题和 Hero 数字）
- **正文字体**：Quicksand（圆体无衬线，温暖可读）
- **等宽字体**：JetBrains Mono（数据数字、代码块）
- **CSS Import**：`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Quicksand:wght@300;400;500;600;700&display=swap');`

### 字体层级

| 用途 | 字体 | 大小 | 字重 |
|------|------|------|------|
| Hero 标题 | Caveat | 2.5rem / 40px | 700 |
| 页面标题 | Caveat | 1.8rem / 29px | 600 |
| 区块标题 | Quicksand | 1.25rem / 20px | 600 |
| 卡片标题 | Quicksand | 1rem / 16px | 600 |
| 正文 | Quicksand | 0.95rem / 15px | 400 |
| 辅助文字 | Quicksand | 0.8rem / 13px | 400 |
| 数据数字 | JetBrains Mono | 1rem / 16px | 500 |

---

## 四、间距与圆角

### 间距系统（基于 4px）

| Token | 值 | 用途 |
|-------|----|------|
| `space-1` | 4px | 图标与文字间距 |
| `space-2` | 8px | 紧凑内边距、标签间距 |
| `space-4` | 16px | 默认内边距、卡片内间距 |
| `space-6` | 24px | 区块间距 |
| `space-8` | 32px | 页面级间距 |
| `space-12` | 48px | 大区块分离 |
| `space-16` | 64px | 页级顶部/底部留白 |

### 圆角系统

| Token | 值 | 用途 |
|-------|----|------|
| `radius-sm` | 6px | 标签、小徽章、状态点 |
| `radius-md` | 10px | 按钮、输入框、下拉菜单 |
| `radius-lg` | 16px | 卡片、面板、列表项 |
| `radius-xl` | 24px | 弹窗、底部导航、大面板 |

---

## 五、毛玻璃效果规范

### 玻璃卡片（默认）
```css
.glass-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(146, 64, 14, 0.10);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(146, 64, 14, 0.06);
}
```

### 玻璃导航栏
```css
.glass-nav {
  background: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(146, 64, 14, 0.08);
  border-radius: 20px;
}
```

### 玻璃弹窗/Sheet
```css
.glass-modal {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  box-shadow: 0 8px 48px rgba(146, 64, 14, 0.10);
}
```

### 深色模式玻璃
```css
.dark .glass-card {
  background: rgba(41, 37, 36, 0.70);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.20);
}
```

---

## 六、组件规范

### 按钮

| 类型 | 样式 |
|------|------|
| **主按钮** | `bg-gradient-to-br from-[#92400E] to-[#A16207]` + 白色文字 + `radius-md`(10px) + `py-3.5 px-7` + `shadow-md shadow-amber-900/25` |
| **次按钮** | `glass-card` + `#92400E` 文字 + `radius-md` |
| **幽灵按钮** | 透明底 + `border border-[#F1E8E2]` + `#78716C` 文字 |
| **危险按钮** | `bg-[#DC2626]` + 白色文字 + `radius-md` |
| **按下态** | 涟漪扩散动画（从触点中心扩散），scale 0.97→1.0 spring |
| **禁用态** | opacity 0.4 + cursor not-allowed |

### 输入框

- 玻璃底 `rgba(255,255,255,0.55)` + blur(10px)
- 边框 `1px solid rgba(146,64,14,0.12)`
- 圆角 10px，内间距 `py-3 px-4`
- 标签在输入框上方，字号 12px，颜色 `#92400E`，加粗
- 错误态：边框变 `#DC2626`，下方显示红色提示文字
- 聚焦态：ring `#92400E` 2px

### 底部导航（移动端）

- 最多 5 项：首页、美食、媒体、记账、任务
- 每项包含图标 + 文字标签
- 毛玻璃底 `rgba(255,255,255,0.75)` + blur(20px)
- 圆角 20px，左右 margin 8px，底部考虑 safe-area
- 激活项：`#92400E` 色，加粗
- 非激活项：`#A8A29E`

---

## 七、布局策略

### 桌面端（≥1024px）
- 左侧固定侧边栏（240px），毛玻璃底，支持折叠为仅图标(64px)
- 右侧内容区，max-width 1200px，居中
- 侧边栏内容：Logo → 7个模块链接 → 设置（底部）

### 移动端（<1024px）
- 顶部 Header 显示页面标题
- 底部固定 5 Tab 导航
- 内容区全宽，padding 16px
- FAB 按钮（右下角），bottom 需考虑底部导航高度 + safe-area

### 断点
| 断点 | 宽度 | 布局变化 |
|------|------|---------|
| sm | 375px+ | 单列 |
| md | 768px+ | 双列卡片 |
| lg | 1024px+ | 侧边栏展开 |
| xl | 1440px+ | 内容区 max-w 增大 |

---

## 八、仪表盘首页设计

### 内容模块（从上到下）

1. **问候语 + 日期天气**：左侧"早上好/下午好/晚上好 ☀️"，右侧日期+天气图标+温度
2. **概览卡片区**（2×2 网格）：本周美食数、本月支出、正在看的媒体、待办任务数。每张卡片可点击跳转
3. **进行中列表**：聚合展示"在看/在玩/在读/待办"，每项可点击
4. **消费概览**：当月支出/收入/结余，大数字展示
5. **最近动态时间线**：跨模块聚合，按时间倒序，显示相对时间
6. **年度评分 Top 3**：各模块独立 Tab，展示评分最高的 3 条

### 空状态
- 新用户：各模块引导卡片 + "开始记录你的第一餐" 等 CTA
- 部分有数据：隐藏无数据模块，展示已有内容

---

## 九、交互规范

### 按下反馈
- 涟漪扩散：从触点中心扩散，持续时间 300ms
- Spring scale：0.97 → 1.0（damping:15, stiffness:120）
- 反馈在 80-100ms 内开始

### 动画
- 微交互：150-300ms，ease-out
- 页面切换：200-300ms 淡入 + Y 轴 10px 位移
- 列表交错入场：stagger 30-50ms per item
- 弹窗/Sheet：从底部滑入 + 淡入，300ms spring
- 尊重 `prefers-reduced-motion`

### Toast
- 右下角固定，从右侧滑入
- 成功：绿色，3 秒自动消失
- 错误：红色，5 秒或手动关闭
- 使用 `aria-live="polite"`

### 删除确认
- 所有删除操作弹出确认弹窗
- 标题："删除XX"，内容："确定要删除「{名称}」吗？此操作不可撤销。"
- 取消按钮（灰色）+ 确认按钮（红色）

---

## 十、图标规范

- 图标库：Lucide Vue（`lucide-vue-next`，项目已安装）
- 尺寸：16px(内联) / 20px(按钮) / 24px(导航) / 32px(功能图标)
- 描边宽度：统一 1.5px
- 风格：统一 outline 风格
- 禁止使用 emoji 作为结构性图标

---

## 十一、实现注意

### 与现有系统的关系
- 保留所有后端 API（`server/api/`）不变
- 保留数据库 schema 不变
- 保留 composables 不变（`useApi`, `useTheme`, `useDict`, `useToast` 等）
- 重写所有页面组件（`pages/`）
- 重写所有 UI 组件（`components/`）
- 更新 Tailwind 配置，添加自定义 design tokens
- 更新 `nuxt.config.ts` 中的 CSS 变量

### 字体加载策略
- 使用 `font-display: swap` 避免 FOIT
- 预加载 Caveat 和 Quicksand 的 woff2 子集

### 渐进迁移
1. 先建立全局 CSS 变量和 Tailwind tokens
2. 重写布局组件（`layouts/default.vue`、`AppHeader`、`Sidebar`、`BottomNav`）
3. 重写仪表盘首页
4. 逐模块重写列表页、添加页、详情页、编辑页
