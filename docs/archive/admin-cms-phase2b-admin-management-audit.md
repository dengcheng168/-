# 第二阶段 B：管理员管理、权限完整性和审计闭环 — 实施记录

## 背景与范围裁剪说明

本批次是对 [`admin-cms-phase3-roles-audit.md`](admin-cms-phase3-roles-audit.md)（前一批次，下称"上批次"）
遗留的"未实施范围"里明确点名的两项做完整补齐：**管理员账号的新增/停用 UI** 和 **操作日志只覆盖产品模块**。
同时按用户这次给出的七节需求（管理员管理、登录限流增强、角色迁移完整性、操作日志闭环、权限矩阵、测试、
提交）逐项实施。

**本批次明确不做**（用户原话）：产品编辑器重构、内容模块重做、多语言 Translation 表、Meta Pixel、GA4、
Google Ads、GTM、Cookie Consent。技术栈延续上批次决定：继续 Prisma + SQLite + 自建 JWT/httpOnly Cookie +
argon2，未引入 NextAuth/PostgreSQL。

## 一、管理员管理

新增 `backend/src/modules/admin-users/`（schema/service/controller/routes）+ 前端
`frontend/src/app/admin/(dashboard)/settings/admin-users/`（列表页、新增页、详情页）。全部路由挂载
`requireRole(ADMIN_MANAGE_ROLES)`（当前即 `SUPER_ADMIN`），前端列表/详情页额外用 `getCurrentAdmin()` +
`AdminForbidden` 兜底，双重保护。

功能：查看列表（邮箱/姓名/角色/状态/最近登录/锁定状态）、创建、修改姓名/邮箱/角色/启用状态、重置密码、
查看近期失败次数与当前锁定状态、手动解锁、强制下线（使已有登录失效）。

安全约束落实情况：

- 密码用 argon2id 哈希存储；`ADMIN_LIST_SELECT` 常量显式排除 `passwordHash` 字段，列表/详情接口的 Prisma
  查询永远不会把哈希带出数据库层。
- 未在任何日志/审计记录里出现明文密码或哈希——见下方"敏感字段脱敏"。
- `updateAdminUser` 内部先查出当前有效 `SUPER_ADMIN` 数量，若本次修改会让该数量归零（停用/改角色导致的
  最后一个超级管理员失效）则抛 `LastSuperAdminError`，controller 捕获后返回 `409`。
- `updateAdminUser` 额外检查"是否本人在操作自己的账号且试图停用自己"，是则抛 `SelfDeactivationError` →
  `409`（避免超级管理员误操作把自己锁在门外）。
- 邮箱唯一性冲突：走 Prisma `P2002` → 全局错误处理器统一转成可读 `409`（这条链路是上一批次已修的，本批次
  复用）。
- 创建时的 zod schema（`admin-users.schema.ts`）做服务端校验（邮箱格式、密码长度、角色枚举）。
- 所有增删改操作（create/update/reset-password/unlock/revoke-sessions）都调用 `auditLogFromRequest` 写审计
  日志，见第四节。

**未做**：可自定义的细粒度权限编辑器——按用户要求保持三档固定角色，权限矩阵是代码常量（见第五节），不是
数据库可编辑项。

## 二、登录限流和账号锁定增强

`backend/src/modules/auth/auth.service.ts` 从单一邮箱维度重写为三维度组合策略：

| 维度 | 阈值 | 目的 |
|---|---|---|
| 邮箱+IP | 5 次/15 分钟 | 主要锁定条件，最贴近"同一个人在同一个地方连续输错" |
| IP 全局（不区分邮箱） | 15 次/15 分钟 | 防同一 IP 对多个邮箱做密码喷洒（credential spray） |
| 邮箱全局（不区分 IP） | 30 次/15 分钟 | 阈值刻意设高——防止攻击者靠跨大量 IP 反复猜错密码，把真管理员的邮箱
维度锁死，形成对真实用户的 DoS |

`resolveEmailFailureWindowStart()` 取 {15 分钟前, 最近一次成功登录时间, 最近一次手动解锁时间} 里最晚的
一个作为查询起点——"清除失败次数"是通过收窄查询时间窗口实现的，`LoginLog` 行永不删除，审计历史完整保留
（`test/login-lockout.test.ts` 有专门测试断言这一点）。

**防止用户名枚举**：不存在的邮箱和密码错误现在返回完全相同的响应体和状态码（`401` + 统一错误消息）。为
了不通过响应耗时侧信道泄露"邮箱是否存在"，模块加载时预计算一个 dummy argon2 哈希（`DUMMY_PASSWORD_HASH`），
在邮箱不存在 / 账号已停用这两条路径上也去 `verify()` 这个 dummy 哈希，让四种失败原因（邮箱不存在/密码错/
账号停用/账号锁定）的响应耗时量级一致。

**失败原因分类记录但不记密码**：`LoginLog.reason` 记录 `INVALID_CREDENTIALS` / `ACCOUNT_INACTIVE` /
`LOCKED_EMAIL_IP` / `LOCKED_IP_WIDE` / `LOCKED_EMAIL_WIDE` 等枚举值，从不写入尝试的密码本身。

**可信代理下的真实 IP**：新增 `TRUST_PROXY` 环境变量（`backend/src/config/env.ts`，默认
`'loopback, uniquelocal'`），替换原来写死的 `trustProxy: true`。原写法会信任任意客户端自己伪造的
`X-Forwarded-For`，等于让 IP 维度限流形同虚设（攻击者随便改这个头就能让每次请求"看起来"来自不同 IP）；
现在只信任回环地址和内网地址发来的转发头，生产环境部署在 Nginx 之后时需要确认 Nginx 的地址落在这个范围
内（`docker-compose.prod.yml` 里的默认拓扑满足这一点，如果换了反代拓扑需要相应调整这个变量）。

**状态码**：`429` 用于锁定/限流命中，`403` 用于权限不足，`401` 用于未登录/凭据错误——已经在
`admin-security.test.ts` 里用真实 `app.inject()` 请求逐一断言。

## 三、角色迁移完整性检查

全局搜索确认 `EDITOR` 只作为历史记录出现在旧迁移文件的 `UPDATE` 语句和文档说明里（如实记录"曾经叫这个
名字"），当前代码路径（后端枚举、前端角色常量、种子数据、测试数据、权限检查、菜单显示、JWT 解析）里
没有任何一处会把 `EDITOR` 当作一个可用角色值处理。

**采用的策略是上批次已经确定、本批次继续沿用并强化的第三种方案**（不是需求文档给的两个选项中的任何一个，
在这里明确向用户说明这个偏离和理由）：

- 需求文档给的选项是 (1) 临时把 `EDITOR` 兼容映射成 `CONTENT_ADMIN`，或 (2) 用权限版本号强制旧 Session
  失效、要求重新登录。
- 实际采用的是 **DB 权威校验**：`backend/src/middleware/require-auth.ts` 的 `requireAuth` 在每个已认证请求
  上都会查一次数据库，取 `{isActive, role, sessionVersion}` 的当前值，**永远用数据库里的最新角色覆盖
  `request.user.role`**，JWT 里带的角色 claim 只当作请求时的身份令牌，从不被信任用于鉴权判断。
- 效果比选项 (1)（兼容映射）更彻底：不管 JWT 里躺着的是 `EDITOR` 还是别的任何未知字符串，只要这个用户在
  数据库里的当前角色是三档合法角色之一，下一次请求就会拿到正确权限；如果数据库里的角色不在
  `ADMIN_ROLES` 三个合法值之内，`can()`/`rolesWithPermission()` 对未知角色一律返回"无权限"（
  `permissions.test.ts` 里的 `unknown role has no permissions anywhere (fails closed)` 用例专门断言这条），
  硬约束"不得让旧 Session 因未知角色获得默认权限"由此在校验层面直接满足，且不需要像选项 (2) 那样强制
  所有人重新登录。
- 额外叠加了选项 (2) 的机制作为"全局失效"兜底：新增 `PERMISSION_VERSION` 常量（当前值 `2`），写入 JWT 的
  `pv` claim，每次请求校验是否等于当前常量值，不等则视为未认证——用于未来权限模型发生不兼容变更时，仍然
  保留"一次性让所有旧 Session 失效"的开关，不依赖 DB 校验单独兜底。
- 另有 `AdminUser.sessionVersion`（JWT 里的 `sv` claim）作为**单个用户**级别的强制下线开关，管理员管理页
  的"强制下线"按钮和密码重置操作都会递增它。

## 四、操作日志闭环

统一服务 `backend/src/lib/audit-log.ts`，签名与需求文档完全一致：

```ts
auditLog(prisma, {
  actorId, actorEmail, actorRole, action, resourceType, resourceId,
  before, after, ipAddress, userAgent, result, metadata,
});
```

`auditLogFromRequest(prisma, request, entry)` 是标准调用方式，自动从 Fastify `request` 上取
actor/IP/User-Agent，保证全站调用格式统一，不存在"某个模块自己发明一套日志格式"的情况。

**已接入的写操作**（这次新增覆盖，上批次只有产品模块）：管理员创建/修改/启停/角色变更/密码重置/手动解锁/
强制下线、产品增删改及状态变更、产品分类、博客文章/分类/标签、证书、FAQ、页面文案更新、导航菜单、301
重定向、媒体更新与删除、全站设置（联系方式/SEO/社交/WhatsApp/SMTP/Turnstile 等全部 8 个 PATCH 端点）、
询盘状态变更、登录成功/失败/登出。逐个模块的 controller 改动都是同一个模式：捕获操作前后的必要字段，调用
`auditLogFromRequest`。

**失败不回滚**：`auditLog()` 内部 `catch` 掉自身的写入失败并只打日志，不会让调用方的主业务操作跟着失败——
这是需求里"日志失败不能回滚主业务"的直接体现；需求里提到的"除非是必须审计的高风险操作"这个例外目前**没有**
额外实现单独的强一致性路径（即高风险操作日志写入失败时，操作本身依然会成功），这是本批次一个明确的
简化，如果需要真正"审计失败则回滚"的语义，需要为管理员管理这类高风险操作单独包一层事务，属于后续可选
加固项，不在本次范围内假装已经做了。

**敏感字段脱敏**（`redact()` 函数，`audit-log.test.ts` 覆盖 7 个用例）：递归遍历 `before`/`after`/
`metadata` 对象，字段名（大小写不敏感）包含 `password`/`token`/`secret`/`smtp` 密码/`turnstileSecretKey`
等关键字子串的一律替换成 `[REDACTED]`。子串匹配是刻意选择的保守策略（宁可多脱敏几个无关字段，也不漏掉
真正敏感的字段），`audit-log.test.ts` 里有一条用例专门记录这个取舍（`passwordlessLogin` 这种字段也会被
脱敏，接受这个假阳性）。

**体积控制**：`redact()` 对超过 500 字符的字符串截断并标注"truncated"，数组超过 20 项截断并加一条"...N
more"标记；`safeStringify()` 对最终 JSON 加 4000 字符硬上限，且处理循环引用不抛异常（用一个哨兵值代替）。

**页面权限与形态**：`/admin/settings/audit-logs`、`/admin/settings/login-logs` 均 `requireRole(['SUPER_ADMIN'])`
（通过 `LOG_VIEW_ROLES` 常量派生，不是硬编码字符串）。两个页面都新增了按时间/操作人/action/
resourceType/result 的筛选表单（GET 查询参数驱动，服务端过滤）。两个页面都是纯只读展示——没有编辑/删除
按钮，符合"日志本身不可篡改"的要求。

## 五、权限矩阵

新增 `backend/src/config/permissions.ts`，`PERMISSION_MATRIX: Record<AdminRole, Partial<Record<Resource,
Action[]>>>` 是唯一的权限真源，`can(role, resource, action)` 和 `rolesWithPermission(resource, action)` 是
唯一的查询方式。`backend/src/config/roles.ts` 里原来分散硬编码的各组路由守卫角色列表（`CONTENT_ROLES`/
`INQUIRY_ROLES`/`ADMIN_MANAGE_ROLES`/`SETTINGS_SENSITIVE_ROLES`/`LOG_VIEW_ROLES`）现在全部通过
`rolesWithPermission()` 从矩阵派生，不再是各自独立维护的字符串数组——避免"改了矩阵却忘了同步某个路由的
硬编码列表"这类问题在结构上就不可能发生。

矩阵内容核对（`permissions.test.ts` 逐条断言）：

- `SUPER_ADMIN`：`admins`/`settingsSensitive`/`logs`/`inquiries`/`products` 等全部资源读写皆为 `true`。
- `CONTENT_ADMIN`：`products`/`productCategories`/`pages`/`blog`/`faqs`/`certificates`/`media` 读写为
  `true`；`admins`/`settingsSensitive`/`logs`/`inquiries` 写权限为 `false`。
- `SALES`：仅 `inquiries` 写为 `true`；`products`/`pages`/`blog`/`faqs`/`certificates`/`admins`/
  `settings`/`settingsSensitive`/`logs` 读写皆为 `false`。
- 未知角色（如残留的 `EDITOR` 或任意乱填值）在矩阵里查不到条目，`can()` 直接返回 `false`——失败关闭
  （fail closed），不是失败开放。

**前端菜单隐藏只是 UX**：`ADMIN_NAV` 按角色过滤只影响侧边栏是否显示某个入口，所有实际写操作的强制点都在
后端路由的 `requireRole` 上，就算有人绕过前端直接拼 URL 或用 curl 打 API，后端仍然独立校验。

## 六、测试与真实 HTTP 验证

### 自动化测试（`backend/test/`，`node --test` + `tsx`，无 Jest/Vitest，与现有模式一致）

| 文件 | 用例数 | 覆盖 |
|---|---|---|
| `permissions.test.ts` | 6 | 权限矩阵三档角色 + 未知角色 fail-closed |
| `audit-log.test.ts` | 7 | 脱敏、截断、循环引用、undefined 处理 |
| `login-lockout.test.ts` | 6 | 三维度锁定、清零窗口、历史不删除 |
| `admin-security.test.ts` | 16 | 见下表 |
| `auth.test.ts`（原有，本批次改了清理逻辑） | 3 | 登录成功/失败/未登录访问 `/me` |

`admin-security.test.ts` 用 `app.inject()` 直接模拟真实 HTTP 请求/响应周期（不开真实 socket，但走完整的
路由+中间件+序列化链路），16 个用例逐条对应需求第六节列出的场景，包含（节选，完整列表见测试文件）：

- SALES 对产品写路由 → `403`；SALES 对询盘路由 → 成功
- CONTENT_ADMIN 对产品写路由 → 成功；对管理员管理路由 → `403`
- SUPER_ADMIN 创建管理员成功；停用"最后一个超级管理员"→ `409`（`LastSuperAdminError`）
- 不存在的邮箱与密码错误返回完全相同的响应
- 停用账号无法登录
- 角色变更后，下一次请求立刻拿到新角色（验证 DB 权威校验，不需要等 Session 过期）
- 管理员相关操作会生成审计日志，且日志内容里不含明文密码/Token/Secret
- Prisma 唯一约束冲突返回可读 `409`
- 限流命中返回 `429`；未登录返回 `401`；权限不足返回 `403`

全部 43 个测试（`npm test`）通过：

```
ℹ tests 43
ℹ pass 43
ℹ fail 0
ℹ duration_ms 28630.6931
```

### 真实浏览器端到端验证（Chrome，走本地 dev server，非假设）

1. 用真实种子超级管理员账号 `admin@example.com` 登录后台。
2. 打开 `/admin/settings/admin-users`，确认列表页渲染真实数据。
3. 打开 `/admin/settings/admin-users/new`，填写并提交创建一个 `CONTENT_ADMIN` 测试账号
   `browser-verify-content@example.com`，提交后正确跳转回列表页，列表页确认该账号出现。
4. 打开该账号的详情页 `/admin/settings/admin-users/75`，点击"强制下线"——**首次点击时发现一个真实 bug**
   （见下方"顺带修复的真实 bug"），修复后重新验证：Toast 提示"已强制下线，该管理员需要重新登录"，直接查
   数据库确认 `sessionVersion` 从 1 递增，且生成了一条 `admin_user.revoke_sessions` 审计日志。
5. 用脚本对该测试账号连续提交 5 次错误密码，刷新详情页确认"近期失败次数：5 · 当前已锁定"正确显示。
6. 点击"手动解除锁定"，Toast 提示"已解除锁定"，页面刷新后显示"近期失败次数：0 · 当前未锁定"。
7. 深色模式切换：点击后台右上角主题按钮，管理员列表页、表格、Badge、账户菜单下拉（Radix Portal）均正确
   套用深色配色，无样式错位。
8. 切回浏览前台首页 `/`，截图确认前台配色（导航栏深蓝、Hero 区域等）未受后台深色模式影响，`.admin-theme`
   作用域隔离生效。
9. 清理：删除测试账号 `browser-verify-content@example.com` 及其关联的 `LoginLog`/`AuditLog` 残留记录，
   后台管理员列表恢复只剩 `admin@example.com` 一条真实记录。

### 顺带修复的真实 bug（跟需求列出的场景无关，是验证过程中意外发现的）

`frontend/src/lib/api/admin-client.ts` 的 `adminFetch()` 无论调用方是否传 `body`，都无条件带上
`Content-Type: application/json` 请求头。Fastify 的 JSON body parser 在"有这个请求头但 body 为空"的情况
下会直接返回 `400`。本批次新增的"手动解锁"和"强制下线"两个按钮都是不带 body 的 `POST`，第一次真实浏览器
点击测试时，Toast 报错被 Portal 挡住没看到，UI 表现是"点了没反应"；排查后发现这**不是本批次新代码的问题，
而是一个原本就存在、影响全站所有不带 body 的写操作的 bug**——用同样的方式验证发现，博客标签、产品、证书、
FAQ、导航、重定向、媒体、询盘等模块的**所有删除按钮**（这些请求本来就不带 body）此前在真实环境下同样会
静默失败。修复方式：只有 `init.body` 存在时才附加 `Content-Type` 头。修复后用不带任何 `Content-Type` 头
的真实 `fetch()` 请求（模拟浏览器/Next.js Server Action 的真实行为，而不是会自带默认头的 PowerShell
`Invoke-WebRequest`）重新验证了"强制下线"接口和一个真实的博客标签删除接口，均返回 `200`，随后完整跑了一遍
`npm test`（43 个用例）确认无回归。

## 七、数据库迁移

新增 `20260720062906_admin_user_management_and_audit_log`：

- `admin_users` 表新增 `unlockedAt DATETIME`（可空）和 `sessionVersion INTEGER NOT NULL DEFAULT 1`。
- `login_logs` 表新增复合索引 `(ipAddress, createdAt)` 和 `(email, ipAddress, createdAt)`，支撑三维度限流
  查询的性能。
- `audit_logs` 表新增 `actorRole`/`result`（默认 `'SUCCESS'`）/`beforeData`/`afterData`/`metadata`/
  `userAgent` 字段，以及 `action` 字段索引。

均为纯新增列/索引，不删除、不改类型、无损，可安全回滚（`DROP` 对应的新列/索引即可，`sessionVersion` 有
默认值不影响存量数据）。

## 八、API 变更

新增（均挂 `requireRole(ADMIN_MANAGE_ROLES)`，当前即仅 `SUPER_ADMIN`）：

```
GET    /api/admin/admin-users
POST   /api/admin/admin-users
GET    /api/admin/admin-users/:id
PATCH  /api/admin/admin-users/:id
POST   /api/admin/admin-users/:id/reset-password
POST   /api/admin/admin-users/:id/unlock
POST   /api/admin/admin-users/:id/revoke-sessions
```

变更：`GET /api/admin/login-logs`、`GET /api/admin/audit-logs` 新增查询参数过滤（前者 `email`/`success`，
后者 `adminEmail`/`action`/`entityType`/`result`/`from`/`to`）；`/api/admin/settings/smtp`、
`/settings/turnstile`、`/settings/smtp/test` 的角色守卫从硬编码 `['SUPER_ADMIN']` 改为
`SETTINGS_SENSITIVE_ROLES`（当前派生结果相同，仍是仅超级管理员，但现在是从矩阵派生而非独立维护）。

## 九、安全策略变更小结

- 登录失败锁定：邮箱维度单一阈值 → 邮箱+IP/IP 全局/邮箱全局三维度组合。
- 授权时效性：JWT 角色 claim 权威 → 每请求 DB 权威校验（角色变更/停用立即生效，不需要等 Session 过期）。
- 反向代理信任范围：`trustProxy: true`（信任任意声称的转发头）→ `TRUST_PROXY` 环境变量显式限定可信来源。
- 邮箱枚举防护：错误消息 + 响应耗时都不再泄露"邮箱是否存在"。
- 全站写操作审计覆盖：产品模块 → 管理员/产品/分类/博客三件套/证书/FAQ/页面/导航/重定向/媒体/设置/询盘/
  登录，全覆盖。
- 无 body 请求的 Content-Type 处理：修复后不再触发 Fastify 400，间接修复了全站删除按钮此前在生产环境
  下会遇到的静默失败问题（见第六节）。

## 十、新增依赖

无。全部用现有依赖实现。

## 十一、未实施 / 已知简化范围（明确列出，不假装完成）

- 自定义细粒度权限编辑器——按要求维持三档固定角色。
- "高风险操作审计失败则回滚业务操作"的强一致性语义——当前所有审计写入失败都只记日志、不影响主操作，
  包括管理员管理这类高风险操作在内，没有做区分。
- 产品编辑器重构、内容模块重做、多语言 Translation 表、Meta Pixel/GA4/Google Ads/GTM/Cookie Consent——
  按用户明确要求，本批次未触碰。
- 侧边栏"角色"/"权限"两个可视化配置页面仍标"待开发"，权限矩阵仍是代码常量。

## 十二、风险与后续建议

- `TRUST_PROXY` 的默认值假设标准的"本机 Nginx 反代"拓扑；如果未来换成云厂商的负载均衡/CDN 架构，需要
  重新评估这个变量的可信网段范围，否则要么 IP 限流失效（信任范围太宽），要么真实用户 IP 取不到（信任
  范围太窄导致退回到反代自身 IP，多个用户共享同一限流桶）。
- `adminFetch()` 的 Content-Type 修复影响面较大（全站所有无 body 写操作），虽然本批次已经跑了完整测试
  套件+构建+多个真实端点验证，但建议下次动前台/后台任一批次时留意一下各模块删除按钮是否仍表现正常。
- 审计日志表目前没有归档/清理策略，长期运行后体积会持续增长，如果后续有需要可以加一个按时间归档到冷
  存储的任务。
