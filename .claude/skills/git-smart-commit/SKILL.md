---
name: git-smart-commit
description: |
  智能分析代码变更，自动生成有意义的 commit message 并提交。
  触发条件：用户提到"提交"、"commit"、"提交代码"、"git commit"、"自动提交"等场景。
  自动检查 git 状态、分析 diff 内容、生成约定式提交信息、执行提交，并可选的推送到远程。
allowed-tools:
  - Bash
  - Read
metadata:
  trigger: 用户请求 git 提交、commit 代码
  source: LifeOS 项目自定义 skill
---

# Git Smart Commit — 智能 Git 提交

你是一位 Git 提交专家，负责分析代码变更并生成高质量的 commit message。

## 执行流程

### 步骤 1：检查仓库状态

```bash
git status
git diff --stat
git diff --cached --stat
git log --oneline -10
```

### 步骤 2：分析变更内容

对每个变更文件，理解它做了什么：

- **新增文件**：是什么模块、什么功能
- **修改文件**：改了什么逻辑、修了什么 bug
- **删除文件**：删除了什么、为什么

如果有未暂存的变更，询问用户是否一并暂存。

### 步骤 3：生成 Commit Message

遵循 **Conventional Commits** 规范：

```
<type>(<scope>): <subject>

<body>
```

**type 类型识别规则**：

| type       | 识别条件                             |
| ---------- | ------------------------------------ |
| `feat`     | 新增页面、组件、API、功能逻辑        |
| `fix`      | 修复 bug、类型错误、运行时错误       |
| `refactor` | 重命名、提取函数、调整结构但行为不变 |
| `style`    | 仅 CSS/Tailwind 样式修改、格式化     |
| `docs`     | 仅 .md 文档修改                      |
| `chore`    | 配置文件、依赖、.gitignore、构建脚本 |
| `perf`     | 性能优化、减少渲染                   |
| `test`     | 测试文件                             |

**scope 自动推断规则**：

| scope      | 文件路径匹配                                                      |
| ---------- | ----------------------------------------------------------------- |
| `foods`    | `pages/foods/`, `server/api/foods/`, `components/foods/`          |
| `media`    | `pages/media/`, `server/api/media/`, `components/media/`          |
| `games`    | `pages/games/`, `server/api/games/`, `components/games/`          |
| `books`    | `pages/books/`, `server/api/books/`, `components/books/`          |
| `expenses` | `pages/expenses/`, `server/api/expenses/`, `components/expenses/` |
| `tasks`    | `pages/tasks/`, `server/api/tasks/`, `components/tasks/`          |
| `stats`    | `pages/stats/`, `server/api/stats/`, `components/dashboard/`      |
| `dict`     | `server/api/dict/`, 字典相关                                      |
| `layout`   | `components/layout/`, `app.vue`, `layouts/`                       |
| `common`   | `components/common/`, `composables/`                              |
| `config`   | `nuxt.config.ts`, `tailwind.config.ts`, `package.json`, `.env`    |

**subject 规则**：

- 中文描述，≤ 50 字符
- 不加句号
- 说清楚做了什么，不描述代码

**body 规则**（可选，复杂变更时添加）：

- 列出 2-5 条关键变更点
- 每条一行，`- ` 开头

### 步骤 4：展示并确认

将生成的 commit message 展示给用户确认：

```
📋 提交预览
═══════════════════════════════
feat(foods): 添加美食列表页和评分组件

- 新增 FoodCard 卡片组件（玻璃态样式）
- 新增 RatingStars 评分组件 (1-10)
- 实现按菜系筛选和分页
- 添加空状态引导 EmptyState
═══════════════════════════════

📁 变更文件 (4)：
M  components/foods/FoodCard.vue
A  components/common/RatingStars.vue
M  pages/foods/index.vue
M  server/api/foods/index.get.ts
```

### 步骤 5：执行提交

用户确认后执行：

```bash
git add <specific-files>   # 精确 add，不用 git add .
git commit -m "$(cat <<'EOF'
<message>
EOF
)"
```

### 步骤 6：询问推送

提交成功后询问是否推送到远程。

## 特殊场景处理

### 场景 A：已有暂存文件 + 未暂存文件

分开显示，询问：

- "当前有 3 个已暂存文件和 2 个未暂存文件。是否一起提交？"

### 场景 B：工作区干净

告知用户当前没有变更，不执行任何操作。

### 场景 C：合并冲突

如果检测到冲突文件（`git status` 中有 `UU`），提醒用户先解决冲突，不执行提交。

### 场景 D：大型提交（>10 个文件）

建议用户拆分成多个提交：

```
⚠️ 本次变更涉及 15 个文件，建议拆分为 2-3 个提交：

建议拆分：
  提交 1: feat(foods): 美食模块 CRUD (6 files)
  提交 2: feat(common): 添加通用评分和空状态组件 (5 files)
  提交 3: chore(config): 更新项目配置 (4 files)

是否按此拆分？还是全部合为一个提交？
```

### 场景 E：commit 失败（pre-commit hook）

如果 hook 失败（如 lint 报错），分析错误、修复、重新提交。**不要用 `--no-verify` 跳过。**

## 质量要求

1. **Subject 必须有意义** — 禁止 "update code"、"fix bug"、"WIP" 等空洞信息
2. **type 要准确** — 新增功能就是 feat，修 bug 就是 fix
3. **scope 要具体** — 精确到模块名
4. **不要手动 add 敏感文件** — `.env`、`credentials.*`、`*.db` 等自动跳过并警告
