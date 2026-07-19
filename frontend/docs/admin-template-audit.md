# 后台 UI 模板集成 — 审计与实施记录（第一阶段）

## 1. 现状审计（实施前）

| 项目 | 结果 |
|---|---|
| Next.js | 16.2.10（App Router，Turbopack） |
| React | 19.2.4 |
| Tailwind CSS | v4（`@import 'tailwindcss'` + `@theme inline`，非 v3 config 文件模式） |
| TypeScript | ^5 |
| 组件体系 | `components/ui/*`（前台英文站点用，PascalCase：`Button.tsx`/`Breadcrumbs.tsx`/`Container.tsx`/`Pagination.tsx`/`SectionHeading.tsx`）与 `components/admin/*`（中文后台用）两套并存 |
| 表单方案 | React 19 `useActionState` + Server Actions（`lib/actions/admin/*.ts`），无 react-hook-form |
| 表格方案 | 手写 `AdminTable`/`AdminTableHead`/`AdminEmptyRow`（`components/admin/AdminTable.tsx`） |
| 图标库 | 手绘 SVG（`components/admin/icons.tsx`），无第三方图标包 |
| 主题配置 | 单一 `globals.css`，`:root` 定义 navy/water/grey 品牌色，无深色模式 |
| 后台 Layout | `app/admin/(dashboard)/layout.tsx`（服务端组件，`getCurrentAdmin()` 校验+`redirect`）+ `AdminShell`（客户端组件，含可折叠 Sidebar + Header） |
| 登录与权限 | JWT httpOnly Cookie，`getCurrentAdmin()` 转发 Cookie 调 `/api/auth/me` 校验；登录页路径刻意混淆为 `/qZzH86tTnyvhqTpk`（非 `/admin/login`），不在本阶段改动 |
| 后台路由 | 均在 `app/admin/(dashboard)/**`，无 `[...catchAll]`，无 `not-found.tsx` |
| 全局 CSS | `frontend/src/app/globals.css`，前台/后台共用同一文件 |
| package.json / 锁文件 | `frontend/package.json`、`package-lock.json`，无 workspace，单一前端项目 |
| 多语言结构 | 无任何 locale/translation 字段或表，`schema.prisma` 已确认（详见早前会话审计），当前仅英文前台+中文后台 |

## 2. Studio Admin 模板审计

- 确认路径：用户所说 "Studio Admin" 对应 GitHub 仓库 [arhamkhnz/next-shadcn-admin-dashboard](https://github.com/arhamkhnz/next-shadcn-admin-dashboard)，其自身文档确实以 "Studio Admin" 作为品牌名。
- 审计使用的 commit：`ba4978aabd19cff7131fd0486a1d07d4244cc13c`（2026-07-19，`main` 分支）。
- 技术栈：Next.js ^16.2.10、React ^19.2.7、Tailwind v4.1.5、TypeScript ^5.9 —— 与本项目版本基本一致，零迁移摩擦。
- 许可证：MIT（见 `frontend/THIRD_PARTY_NOTICES.md`）。
- 依赖清单（`package.json`）包含：`radix-ui`（聚合包）、`@shadcn/react`、`@base-ui/react`、`recharts`、`@tanstack/react-table`、`@fullcalendar/react`、`@dnd-kit/*`、`zustand`、`react-hook-form`+`zod`、`sonner`、`next-themes`、`lucide-react`、`class-variance-authority`、`clsx`、`tailwind-merge`、`biome`（替代 ESLint/Prettier）。
- 内容体量：包含 Default/CRM/Finance/Analytics/Productivity/E-commerce/Academy/Logistics/Infrastructure 等多套演示 Dashboard，以及 chat/email/kanban/calendar/用户管理等演示页面，含大量假数据。

### 兼容性结论

| 类别 | 结论 |
|---|---|
| 可直接复用的"模式"（非代码） | shadcn 语义化 token 命名（`--primary`/`--background`/`--sidebar-*` 等）、`cn()` 写法、`data-slot` 属性约定、`cva` 变体组织方式 |
| 需要适配、不能照搬 | 全部组件源码需按本项目的 Radix 依赖版本、`AdminPortalProvider` 弹层容器、`ADMIN_NAV` 数据结构重新实现；不采用 `radix-ui` 聚合包，改为按需安装单个 `@radix-ui/react-*` 包 |
| 不应引入 | `@base-ui/react`、`zustand`、`@tanstack/react-table`、`recharts`、`@fullcalendar/react`、`@dnd-kit/*`、`biome`、任何演示 Dashboard/chat/email/kanban/calendar 页面、模板品牌 Logo 与作者链接 |
| 需要保留的现有实现 | 认证/Session（`getCurrentAdmin`/httpOnly Cookie）、Server Actions、`/api/*` 路由、Prisma schema、前台路由与组件、`ADMIN_NAV` 驱动的侧边栏数据结构（只重构其渲染层，不换成模板自己的菜单 JSON 格式） |

## 3. 样式隔离实现（已验证）

见 `frontend/src/app/globals.css`：`@theme inline` 只注册 token 名称到工具类，实际取值放在 `.admin-theme` / `.admin-theme.dark` 选择器下，不写入 `:root`。`AdminShell` 根节点挂 `.admin-theme` class；`AdminThemeProvider` 自定义实现（不用 next-themes，避免其默认修改 `document.documentElement` 导致深色模式经 SPA 客户端导航泄漏到前台）。

**验证方式**：本地起 `frontend`/`backend` dev server，浏览器分别截图 `/` 前台首页与 `/admin/products` 后台产品列表，确认前台配色未受影响；切换后台深色模式后再检查前台页面，颜色不变。

## 4. 弹层 Portal 隔离（已验证）

`AdminPortalProvider` 在 `.admin-theme` 内部渲染 `#admin-portal-root`，`Dialog`/`Sheet`/`DropdownMenu`/`Tooltip` 的 Portal 组件均通过 `useAdminPortalContainer()` 把内容渲染到这个节点而非默认的 `document.body`。

**验证方式**：通过浏览器 JS 执行环境直接派发 `pointerdown`/`pointerup`/`click` 事件序列打开账户下拉菜单（Computer 工具的坐标点击在本次调试环境里存在缩放误差，改用事件派发验证功能本身），确认：
- `document.getElementById('admin-portal-root').children.length === 1`
- 菜单内容的 `getComputedStyle().backgroundColor` = `rgb(255,255,255)`（对应 `--popover`）、`color` = `rgb(10,37,64)`（对应 `--popover-foreground`，即 `#0a2540`）、`borderColor` = `rgb(226,230,234)`（对应 `--border`）—— 证明确实读取到了 `.admin-theme` 作用域内的变量，而不是 portal 到 body 后样式丢失。
- `#admin-portal-root` 的父节点 `className` 包含 `admin-theme`，`closest('.admin-theme')` 非空。

Sonner 的 `<Toaster>` 额外验证过：其安装包源码（`node_modules/sonner/dist/index.mjs`）里没有 `createPortal`/`Portal` 相关代码，说明它不会 portal 到 body，直接挂载在 `.admin-theme` 内即可通过普通 CSS 级联继承主题变量，不需要接入 `AdminPortalProvider`。

## 5. 数据链路核实

`GET /api/admin/products` 本地联调核实（登录 `admin@example.com` 后 curl 该接口），响应中确认包含 `sku` 字段（例如 `"sku":"RO-500"`），因为 `listAdminProducts` 底层 Prisma 查询未加 `select`/`omit`，默认返回全部标量字段；产品列表页 SKU 列基于这一核实结果实现，未使用假数据。同时确认当前种子数据只有 6 个产品（`meta.total = 6`），远低于 `pageSize=100`，`ProductListClient` 里仍然加了 `total > rows.length` 时的范围提示，为将来产品数超过 100 时的诚实告知做好准备。

## 6. 后台目录结构现状（供后续批次参考）

产品/博客/FAQ/页面等编辑页面目前仍是原始表单结构（未改动，超出本阶段范围），媒体库仍是最初版本（同上）。本阶段只改了：`AdminShell`/`AdminSidebar`/`AdminHeader`/`Breadcrumb`/`PageHeader`/`AdminTable`/`EmptyState` 的视觉层与 `ADMIN_NAV` 数据结构，以及产品列表页（`app/admin/(dashboard)/products/page.tsx` + 新增 `ProductListClient.tsx`）。
