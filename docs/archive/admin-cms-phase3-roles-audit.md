# 第三阶段：角色权限、登录安全与操作日志 — 实施记录

## 背景与范围裁剪说明

用户提出的完整需求文档（约 29 节，涵盖角色权限、首页/产品/证书/博客/FAQ 全量后台重构、询盘 UTM 追踪、
媒体库、多语言 Translation 表、Meta Pixel/GA4/Google Ads/GTM/Consent Mode v2/统一事件层/事件日志等）
体量相当于从零重建整个后台+营销技术栈，不可能在一个会话里高质量完成。本批次只完成了该文档"第二阶段：
后台基础"里安全相关的部分：**角色权限（服务端真实校验）、登录失败锁定、登录记录、操作日志**。其余章节
（首页/产品等内容模块重做、询盘 UTM、媒体库升级、SEO 全量能力、Meta/Google 追踪、Cookie Consent、多
语言 Translation 表）**均未实施**，见文末"未实施范围"。

**技术栈延续**：继续使用现有 Prisma + SQLite + 自建 JWT/httpOnly Cookie + argon2 认证，未引入 NextAuth，
未迁移 PostgreSQL——这两项都是本文档提议但会显著改变现有生产环境的基础设施决策，未经单独确认不擅自执行。

## 一、角色体系

### 数据模型变化（已迁移，见下方"数据库迁移"）

`AdminUser.role` 从二档字符串取值扩展为三档：`SUPER_ADMIN` | `CONTENT_ADMIN` | `SALES`（原 `EDITOR` 通过
迁移里的 `UPDATE` 语句改名为 `CONTENT_ADMIN`，无数据丢失）。取值定义集中在
[`backend/src/config/roles.ts`](backend/src/config/roles.ts)。

### 服务端强制校验（不是只在前端隐藏按钮）

新增 [`backend/src/middleware/require-role.ts`](backend/src/middleware/require-role.ts)：`requireRole(allowed)`
返回一个 Fastify `preHandler`，角色不在允许列表时返回 `403`。已经挂载到：

- `CONTENT_ROLES`（`SUPER_ADMIN`/`CONTENT_ADMIN`）：产品、产品分类、博客、博客分类、博客标签、证书、FAQ、
  媒体、页面、导航、301 重定向的全部 admin 路由。
- `INQUIRY_ROLES`（`SUPER_ADMIN`/`SALES`）：询盘 admin 路由。
- 全站设置：大部分 PATCH 路由允许 `CONTENT_ROLES`，但 SMTP（凭据）和 Turnstile（密钥）额外叠加了
  `requireRole(['SUPER_ADMIN'])`，两层 preHandler 是"与"的关系，效果是这两个路由只有超级管理员能改。
- 登录记录/操作日志查看：`requireRole(['SUPER_ADMIN'])`。

### 浏览器实测（真实请求，非假设）

1. 用现有超级管理员账号登录、创建一个临时 `SALES` 角色测试账号（`sales-test@example.com`）。
2. 用该账号登录后调用 `GET /api/admin/products` → **403**（预期，销售人员不能碰内容）。
3. 同一账号调用 `GET /api/admin/inquiries` → **200**（预期，销售人员可以看询盘）。
4. 测试完成后已删除该临时账号及其登录记录，不留测试数据在生产库结构里（本批次禁止新增删除功能，
   清理是通过独立的一次性 Node 脚本直接操作数据库完成，不是通过后台 UI）。

### 前端展示

- `frontend/src/lib/auth/roles.ts` 新增角色 label 映射，`AdminHeader.tsx` 和管理员设置页从写死的
  二选一三元表达式改为读这个映射（三档角色都能正确显示中文名）。
- 侧边栏"角色"/"权限"两个子菜单项**仍然标"待开发"**——本批次没有做"数据库里可编辑角色/权限"的 UI，
  角色能做什么是代码里写死的（见上面的路由映射），不是可以在后台界面调整的配置项。如果需要做成可配置，
  是一个单独的、有意义的后续批次，不在本次范围内假装做了。

## 二、登录安全

### 登录失败锁定（新增）

`backend/src/modules/auth/auth.service.ts` 新增 `isLoginLocked()`：同一邮箱 15 分钟内失败次数达到 5 次，
后续请求（不管密码对不对）直接返回 `429`，不再走密码校验。

### 已有的频率限制

`/api/auth/login` 路由本来就配置了 `max: 5, timeWindow: '1 minute'`（按 IP），审计时确认已经存在，本批次
没有重复造轮子。

### 顺带修复的真实 bug（限流响应状态码错误）

浏览器实测锁定逻辑时意外发现：命中限流时后端返回的是 **500** 而不是 **429**（响应体里的错误信息是对的，
只有 HTTP 状态码错了）。根因是 `backend/src/plugins/rate-limit.ts` 里自定义的 `errorResponseBuilder` 只
返回了 `{success:false, error:{...}}`，没有像 `@fastify/rate-limit` 默认实现那样带上 `statusCode: 429`；
这个返回值会被库直接 `throw` 出去，全局错误处理器读不到 `statusCode` 就当成了普通 500 错误。已修复为
显式带上 `context.statusCode`。这是发现即修复的真实 bug，不是本次新增功能引入的（这个文件在本次改动前
就是这个写法），修复后用真实请求重新验证过：命中限流和触发登录锁定都正确返回 429。

### 登录记录

新增 `LoginLog` 表（成功/失败都记，含邮箱、成功与否、失败原因、IP、User-Agent、时间），
`GET /api/admin/login-logs`（超级管理员）和后台页面 `/admin/settings/login-logs`。

## 三、操作日志

新增 `AuditLog` 表 + `backend/src/lib/audit-log.ts` 的 `recordAuditLog()` 辅助函数（尽力而为，写日志失败
不影响业务操作本身）。**目前只接入了产品模块**（创建/更新/删除/发布/下架）作为参考实现，`GET
/api/admin/audit-logs`（超级管理员）和后台页面 `/admin/settings/audit-logs` 已经可以用。其余模块
（博客/FAQ/证书/页面/设置等）尚未接入操作日志，属于后续批次按同样模式逐个补齐的机械工作。

浏览器实测：用超级管理员账号 `PATCH /api/admin/products/1` 修改简短描述，随后 `GET
/api/admin/audit-logs` 确认生成了一条 `product.update` 记录，字段（操作人邮箱、IP、时间、人类可读摘要）
均正确。测试用的编辑内容已经改回原值。

## 四、关于"之前的产品编辑器重构（Phase 2）"

用户在本批次开始前明确要求放弃、不再需要。已删除当时未完成、从未接入任何页面的文件
（`frontend/src/lib/products/editor-transforms.ts` 及其测试、`frontend/src/components/admin/products/`
目录），并把因为那次重构而临时改动的 `DynamicKeyValueTable.tsx`/`ImageUploader.tsx` 还原回上一次真实提交
的版本。产品新增/编辑页面维持 Phase 1 结束时的原样（`ProductForm.tsx` 手写表单），未受影响。

## 五、数据库迁移

- `20260719214838_add_login_and_audit_logs`：新增 `login_logs`、`audit_logs` 两张表；附带一条数据迁移
  `UPDATE admin_users SET role='CONTENT_ADMIN' WHERE role='EDITOR'`。纯新增表 + 无损角色重命名，向后兼容，
  回滚方式：`DROP TABLE login_logs, audit_logs;` 加上如果需要可以把 `CONTENT_ADMIN` 改回 `EDITOR`
  （但角色权限代码此时已经假设三档角色存在，不建议在不同步改代码的情况下单独回滚这一条）。

## 六、新增依赖

无。全部用现有依赖（Fastify/Prisma/zod/Next.js）实现，没有引入新的 npm 包。

## 七、测试与构建结果

```
backend: npm run lint   → 通过
backend: npm run build  → 通过（tsc）
frontend: npm run lint  → 通过
frontend: npx tsc --noEmit → 通过
frontend: npm run build → 通过
```

无自动化测试框架变更（backend 沿用已有的 `node --test`，本批次未新增 `.test.ts`；前端本批次的改动是
路由/中间件/页面级别的，更适合用上面这批真实浏览器 + 真实 API 请求验证，没有为了凑测试数量而写脆弱的
浅层测试）。

## 八、未实施范围（明确列出，不假装完成）

- 首页/关于我们/联系我们等页面管理重做（内容管理，第六节）
- 产品字段扩展（型号、MOQ 单位、参考价格、目标市场等，第七节）——现有 `Product` 模型没有这些字段，
  未经确认不擅自加 Schema
- 证书管理真实工作流、到期提醒（第九节）
- 博客富文本编辑器、定时发布（第十节）
- 询盘 UTM/来源追踪、负责人分配、导出（第十二节）
- 媒体库（视频、批量操作、重复检测等，第十三节）
- 真正的多语言 Translation 表（第十五节）——与项目早前确认的范围冲突，本批次维持"预留但不实现"
- 全量 SEO 管理（结构化数据、hreflang、Sitemap 精细化，第十六节）
- Meta Pixel / Google (GA4/Ads/GTM/Consent Mode v2) / 统一事件层 / 事件日志（第十七至二十二节）
- 仪表盘扩展统计（第二十三节）
- 管理员账号的新增/停用 UI（当前只有服务端角色枚举和路由级校验，没有"超级管理员在后台创建/停用其他
  管理员"的界面；`create-admin` 命令行脚本仍是唯一的开户方式）
- "角色"/"权限"两个可视化配置页面（当前权限是代码写死，不是数据库可编辑项）

## 九、风险与后续建议

- 操作日志目前只覆盖产品模块，如果近期需要审计博客/证书等模块的改动，需要按同样模式补上
  `recordAuditLog()` 调用，工作量是机械的但需要逐个文件过一遍。
- 管理员账号目前只能通过服务器命令行脚本创建，如果需要多个真人管理员协作，"管理员管理" UI 应该是下一
  个安全相关批次的优先项。
- 多语言 Translation 表这个决定建议单独开一次澄清会话确认，因为它是本文档里唯一直接推翻此前已确认范围
  的部分，影响到 Product/Category/BlogPost/Faq/Certificate 等几乎所有内容表的 Schema，属于大改动。
