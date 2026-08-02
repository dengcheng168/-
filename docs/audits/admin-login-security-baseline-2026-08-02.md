# 管理后台登录安全基线审计报告

## 1. 执行摘要

- **审计日期**：2026-08-02
- **当前分支**：`main`
- **执行前 HEAD**：`da72322f4d21d3cf47106bc99d01711825bf4b66`（`refactor(admin): reorganize settings sidebar into focused groups`）
- **执行后 HEAD**：本报告是本轮第一个 commit（`docs(audit): ...`）；紧随其后会再产生一个 `fix(auth): harden admin login baseline` commit，最终 HEAD 以该 commit 为准，具体 SHA 见 `git log -3 --oneline` 结果（本报告不回填，避免出现"报告内容依赖尚未创建的 commit"这种循环引用）。
- **审计范围**：管理后台登录、密码存储、登录失败锁定、Cookie/Session 认证、退出登录、服务端权限校验、登录/操作日志脱敏、Secret 管理、CORS/CSRF 基础防护、Nginx 反向代理配置（只读）。不含前台内容管理业务逻辑本身。
- **当前认证方式**：HttpOnly Cookie（`wp_session`）携带一个 Fastify `@fastify/jwt` 签发的 JWT，`sameSite=lax`、生产环境 `secure=true`、`path=/`、有效期 7 天（`JWT_EXPIRES_IN=7d`）。后端 `requireAuth` 中间件在每次受保护请求上都会重新查库校验账号是否仍启用、`sessionVersion` 是否匹配（支持"强制下线"）、角色是否是数据库当前值，不是单纯信任 JWT 里签发时的快照。
- **当前密码哈希算法**：Argon2id（`argon2` 库，`hashPassword`/`verifyPassword`），无自造弱哈希、无固定盐、无可逆加密。
- **当前 Cookie 认证方式**：见上，Token 全程只出现在服务端之间（Fastify 后端 → Next.js Server Action），从未写入任何会被浏览器 JS 读取的位置，`localStorage`/`sessionStorage` 中确认不存在认证 Token（详见第 3 节）。
- **总体风险等级**：**低**（Low）。未发现 P0/P1 级"可直接导致后台被接管"的漏洞；发现 1 项 P1 级"潜在高风险使能因素"（JWT_SECRET 弱默认值在生产环境下没有强制拒绝启动的门禁，见问题 #1）与 1 项 P2 级基础防护偏弱项（新建/修改密码最低长度为 8 位，未达到本次基线要求的 10 位，见问题 #2），均已在本轮修复。
- **是否存在严重漏洞**：否。
- **是否进行了代码修改**：是，范围极小（详见第 5 节，共 9 个文件：3 个后端 schema/config、1 个新增的纯函数工具模块、2 个新增测试文件、3 个后台前端表单的 `minLength`/提示文案）。
- **是否修改数据库**：否。未执行 migration、未执行 `db push`、未修改 `schema.prisma`。
- **是否需要大规模认证重构**：否。当前认证架构（HttpOnly JWT Cookie + 数据库权威的服务端二次校验 + 三维度登录锁定 + 审计日志脱敏）已经是一套相当成熟、经过多轮加固和单元测试覆盖的实现，不存在"必须推倒重来"的结构性问题。
- **当前是否达到普通企业独立站标准**：是（修复后）。修复前也基本达标，只有 Secret 门禁和密码长度两个可以精确定位、影响面很小的缺口。

## 2. 当前认证架构

| 环节 | 位置 | 说明 |
|---|---|---|
| 登录页面 | `frontend/src/app/admin/login/` 及对应 `loginAction` Server Action | 前端表单 → `loginAction`（`frontend/src/lib/actions/auth.ts`）服务端函数直接 `fetch` 调后端 `/api/auth/login`，Token 不经过客户端 JS |
| 登录 API 路由 | `backend/src/modules/auth/auth.routes.ts` | `POST /login` 单独配置 `rateLimit: { max: 5, timeWindow: '1 minute' }`，比全局 300/分钟更严格 |
| 登录 Controller | `backend/src/modules/auth/auth.controller.ts` | 锁定检查 → 凭据校验 → 记录登录日志/审计日志 → 签发 JWT → 种 Cookie → 响应体也带 token（仅供同进程内 Next.js Server Action 使用，见第 3 节说明） |
| 认证 service | `backend/src/modules/auth/auth.service.ts` | `authenticateAdmin`（时间侧信道安全的凭据校验）、`checkLoginLock`/`recordLoginAttempt`/`getRecentFailureCount`（三维度失败锁定） |
| 管理员 model | `backend/prisma/schema.prisma` 的 `AdminUser` | 含 `passwordHash`、`isActive`、`sessionVersion`、`unlockedAt`、`role` 等字段 |
| 密码哈希/校验 | `backend/src/lib/password.ts` | Argon2id |
| JWT 生成/验证 | `backend/src/plugins/auth.ts`（`@fastify/jwt` 注册）+ `backend/src/middleware/require-auth.ts` | 验证 JWT 签名后，还会用数据库当前状态覆盖校验（权限版本号、账号是否启用、`sessionVersion`） |
| Cookie 设置 | `auth.controller.ts` 的 `loginHandler` + `frontend/src/lib/actions/auth.ts` 的 `loginAction` | 两侧分别在各自域下种 Cookie（因为本地开发时前后端端口不同源） |
| Cookie 清除 | `auth.controller.ts` 的 `logoutHandler` + `frontend/src/lib/actions/auth.ts` 的 `logoutAction` | 均按相同 `path: '/'` 清除 |
| 登录失败计数 | `LoginLog` 表（Prisma），按邮箱+IP / IP 全局 / 邮箱全局 三个维度分别查询计数 | 持久化在数据库，不是内存变量，应用重启不丢失 |
| 锁定截止时间 | 不是固定字段，而是"失败计数窗口"（`resolveEmailFailureWindowStart`），15 分钟滚动窗口 | |
| 账号启用状态 | `AdminUser.isActive` | 登录、`requireAuth`、`meHandler` 三处都会检查 |
| 认证中间件 | `backend/src/middleware/require-auth.ts`（`app.authenticate`） | 每个受保护路由文件的 `preHandler` 钩子里统一挂载 |
| 角色中间件 | `backend/src/middleware/require-role.ts` + `backend/src/config/permissions.ts` 权限矩阵 | 单一事实源，`roles.ts` 的分组常量都从矩阵派生 |
| 登录日志 | `LoginLog` 表 | 只存邮箱/成功失败/失败原因/IP/UA，不存密码 |
| 操作日志 | `AuditLog` 表，写入统一走 `backend/src/lib/audit-log.ts` 的 `auditLog`/`auditLogFromRequest` | 内置敏感字段白名单式过滤（`password`/`token`/`secret`/`jwt`/`cookie`/`authorization`/`smtppassword`/`turnstilesecretkey` 等一律替换为 `[REDACTED]`），并做长度截断 |
| 退出登录 | `logoutHandler`（后端）+ `logoutAction`（前端） + 多标签页广播（`frontend/src/lib/admin/admin-idle-session.ts`） | 退出登录不要求当前 Session 仍有效，保证"退不出登录"这种情况不会发生 |

## 3. 基础安全检查

| 检查项 | 当前状态 | 是否合格 | 证据位置 | 处理结果 |
|---|---|---:|---|---|
| 公开注册 | 不存在。已在 `backend/src/app.ts` 全量路由注册表、以及全仓库 `register/signup/注册` 关键词搜索中确认，只有 `authRoutes`（登录/登出/me）和 `adminUserRoutes`（需登录+SUPER_ADMIN） | 合格 | `backend/src/app.ts:61,96` | 无需处理 |
| 管理员创建权限 | `adminUserRoutes` 挂载 `requireRole(ADMIN_MANAGE_ROLES)`，`ADMIN_MANAGE_ROLES` 由权限矩阵派生，矩阵里只有 `SUPER_ADMIN.admins` 含 `write` | 合格 | `backend/src/config/permissions.ts:53-72`、`backend/test/admin-security.test.ts` 测试 4/17 | 无需处理 |
| 密码哈希 | Argon2id | 合格 | `backend/src/lib/password.ts` | 无需处理 |
| 密码最低长度 | 修复前：新建/重置/自助修改密码均为 8 位，未达 10 位基线 | **不合格 → 已修复** | `admin-users.schema.ts`、`account.schema.ts` | 已改为 10 位，登录时不做长度校验，旧密码不受影响（见问题 #2） |
| passwordHash API 暴露 | 所有管理员相关查询统一使用显式 `ADMIN_LIST_SELECT`（不含 `passwordHash`），并有单测断言响应里 `passwordHash === undefined` | 合格 | `admin-users.service.ts:9-18`、`admin-security.test.ts` 测试 5 | 无需处理 |
| 密码日志泄露 | 请求日志只记录 method/url/statusCode/耗时/IP；操作日志按敏感字段名做 `[REDACTED]` 过滤，且有单测直接断言序列化后的日志不包含明文密码 | 合格 | `backend/src/middleware/request-logger.ts`、`backend/src/lib/audit-log.ts`、`admin-security.test.ts` 测试 14 | 无需处理 |
| 5 次失败锁定 | 同邮箱+同 IP 达到 5 次即锁，15 分钟滚动窗口，有专门单测覆盖 | 合格 | `auth.service.ts` 常量 `EMAIL_IP_THRESHOLD=5`、`test/login-lockout.test.ts` | 无需处理 |
| 15 分钟锁定 | `LOCKOUT_WINDOW_MINUTES=15`，用查询时间窗口实现，不是定时器 | 合格 | `auth.service.ts:4` | 无需处理 |
| 成功后失败次数清零 | 失败计数窗口起点取"最近一次成功登录时间"，成功登录后之前的失败不再计入；有单测验证 | 合格 | `auth.service.ts:71-82`、`login-lockout.test.ts` 用例 5 | 无需处理 |
| 登录基础限速 | 登录路由单独配置 `rateLimit: { max: 5, timeWindow: '1 minute' }`（基于 `@fastify/rate-limit`），另有账号级三维度锁定作为第二层防护 | 合格 | `backend/src/modules/auth/auth.routes.ts:5-13` | 无需处理 |
| 统一错误提示 | 邮箱不存在/密码错误/账号已停用统一返回 401 + 同一句"邮箱或密码不正确"；有单测直接断言两种场景状态码和响应体完全一致；不存在的邮箱也会走一次等耗时的 dummy hash 校验防时间侧信道 | 合格 | `auth.service.ts:16-49`、`admin-security.test.ts` 测试 7 | 无需处理 |
| HttpOnly Cookie | `httpOnly: true`（后端与前端两处设置均一致） | 合格 | `auth.controller.ts:63`、`frontend/src/lib/actions/auth.ts:50` | 无需处理 |
| Secure Cookie | `secure: isProduction`（后端）/`secure: process.env.NODE_ENV === 'production'`（前端），生产环境为 true，本地开发为 false（否则本地 HTTP 无法登录） | 合格 | 同上 | 无需处理 |
| SameSite | 两处均为 `'lax'` | 合格 | 同上 | 无需处理 |
| Cookie 有效期 | 7 天（`COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60`，与 `JWT_EXPIRES_IN=7d` 保持一致），长于建议的 8-12 小时 | 合格（P3 观察项，未强制修改） | `backend/src/config/constants.ts:4-6` | 见第 6 节 |
| Cookie 退出清除 | 后端/前端退出逻辑均以相同 `COOKIE_NAME`（`wp_session`）+ 相同 `path: '/'` 调用 `clearCookie`/`cookies().delete` | 合格 | `auth.controller.ts:95`、`frontend/src/lib/actions/auth.ts:60-63` | 无需处理 |
| localStorage Token | 全仓库搜索确认没有把认证 Token 写入 `localStorage`；唯一用到 `localStorage` 的地方是多标签页空闲登出协调机制，序列化内容只有 `ownerTabId`/`token`（标签页归属令牌，非认证凭据）/`expiresAt`，有单测直接断言其中不含 Cookie/JWT/用户身份字段 | 合格 | `frontend/src/lib/admin/admin-idle-session.test.ts` 用例 13/19 | 无需处理 |
| sessionStorage Token | 同上，未发现任何写入 | 合格 | 同上 | 无需处理 |
| CSRF 或同源保护 | 无独立的 Origin 校验中间件，依靠 `SameSite=Lax`（阻止跨站 POST/PUT/PATCH/DELETE 携带 Cookie）+ CORS 显式白名单（`credentials: true` 搭配的是明确 origin 列表，不是 `*`） 组合 | 合格（按本次基线的"以下任一或组合"标准） | `backend/src/plugins/cors.ts` | 无需处理，见第 6 节记录为可选强化项 |
| 服务端认证 | 除 `health`/`search` 两个公开接口外，全部 `*.routes.ts` 都挂载 `app.authenticate` | 合格 | 见第 4 节调查方法 | 无需处理 |
| 服务端角色权限 | 敏感子路由（`admin-users`、`settings/smtp`、`settings/turnstile`、`settings/site-domain`）均单独挂载对应的 `requireRole`；有单测覆盖 SALES/CONTENT_ADMIN 越权返回 403 | 合格 | `admin-security.test.ts` 测试 1/4/18 | 无需处理 |
| 禁用账号登录 | `authenticateAdmin` 检查 `isActive`；有单测验证正确密码也无法登录 | 合格 | `admin-security.test.ts` 测试 11 | 无需处理 |
| 禁用账号访问 API | `requireAuth` 每次请求都重新查库校验 `isActive`；有单测验证"停用发生在会话中途、旧 JWT 立刻失效" | 合格 | `admin-security.test.ts` 测试 11b | 无需处理 |
| 登录日志 | 只存邮箱/IP/UA/成功失败/失败原因，不存密码/Token | 合格 | `LoginLog` schema、`recordLoginAttempt` | 无需处理 |
| Secret 管理 | `JWT_SECRET` 走环境变量，修复前生产环境缺失时会静默回退到示例占位值继续运行 | **不合格 → 已修复** | `backend/src/config/env.ts` | 见问题 #1 |
| HTTPS 与代理识别 | 仓库自带 `nginx/conf.d/default.conf` 正确转发 `Host`/`X-Real-IP`/`X-Forwarded-For`/`X-Forwarded-Proto`；`TRUST_PROXY` 默认只信任 `loopback, uniquelocal`，与 Docker 内网拓扑匹配；实际生产 HTTPS 由宝塔面板管理，不在本仓库配置范围内，本次未连接、未核实生产真实值 | 合格（仓库层面），生产实际状态未核实（按规则不允许连接生产） | `nginx/conf.d/default.conf`、`backend/src/config/env.ts` 的 `TRUST_PROXY` 注释 | 无需处理，见第 6 节 |

## 4. 发现的问题

### 问题 #1

- **风险等级**：P1
- **文件路径**：`backend/src/config/env.ts`
- **函数或路由位置**：模块顶层的 `JWT_SECRET` zod schema 定义（`z.string().min(1).default('dev-secret-change-me')`），以及紧随 `parsed.data` 之后原本缺失的启动期校验
- **问题描述**：`JWT_SECRET` 环境变量缺失时会静默回退到 `.env.example` 里同样出现的占位字符串 `dev-secret-change-me`，且这个回退不区分 `NODE_ENV`——生产环境如果因为部署疏漏没有设置这个变量，应用会照常启动并用一个任何人 clone 这个公开仓库都能看到的字符串签发管理员登录 JWT。
- **实际证据**：修复前的 `backend/src/config/env.ts` 第 24 行 `JWT_SECRET: z.string().min(1).default('dev-secret-change-me')`，往下直到文件末尾没有任何针对这个值在生产环境下的二次校验。`.env.example` 第 30 行同样写着这个值，说明它是仓库里公开可见的字符串。
- **攻击或故障影响**：如果生产环境确实缺失该变量（本次审计未连接生产环境核实，也不允许核实），攻击者只需要知道这个公开默认值，就能自行签发任意角色（包括 `SUPER_ADMIN`）的有效 JWT，完全绕过登录，直接接管后台。这是"可能直接导致后台被接管"的 P0 级后果，但触发条件（生产环境确实缺失变量）本身未被证实存在，因此把"当前代码允许这种情况发生"本身定级为 P1（高风险认证绕过的潜在使能因素），而不是已确认的 P0。
- **是否已修复**：是。
- **修复方式**：新增 `backend/src/lib/secret-safety.ts`，导出纯函数 `isWeakSecret(value)`，用一个已知弱值集合（`dev-secret-change-me`/`change-me`/`secret`/`development-secret`）做精确匹配（不做熵值评分，避免误伤合法强密钥、也避免超出"修复弱默认 Secret"这一条的最小整改范围）。在 `env.ts` 里，紧跟 `isProduction` 计算之后、任何路由/数据库连接建立之前，增加：
  ```ts
  if (isProduction && isWeakSecret(env.JWT_SECRET)) {
    console.error('生产环境的 JWT_SECRET 是已知的弱默认值，拒绝启动。请设置一个强随机的 JWT_SECRET 环境变量。');
    process.exit(1);
  }
  ```
  开发/测试环境（`isProduction` 为 false）完全不受影响，现有本地开发和测试流程不需要改任何配置。
- **回滚方式**：`git revert` 对应 commit，或手动删除 `env.ts` 里新增的这段 if 块与顶部的 `import`，同时删除 `backend/src/lib/secret-safety.ts` 与两个新增测试文件。回滚后行为等同修复前。
- **对生产的重要提醒（不属于本次修改范围，仅记录）**：本次修改会在下一次生产部署重新构建、重启容器时生效。如果生产环境的 `JWT_SECRET` 真的恰好还是这个占位默认值，应用会在下次重启时直接拒绝启动（这正是预期行为），此时需要运维人员提前在生产 `.env` 里设置一个强随机的 `JWT_SECRET` 值。本次审计按规则未连接生产环境核实这一点，请部署前自行确认。

### 问题 #2

- **风险等级**：P2
- **文件路径**：`backend/src/modules/admin-users/admin-users.schema.ts`（`createAdminUserSchema`、`resetPasswordSchema`）、`backend/src/modules/account/account.schema.ts`（`changePasswordSchema`）
- **函数或路由位置**：`createAdminUserSchema.password`、`resetPasswordSchema.newPassword`、`changePasswordSchema.newPassword` 三处 zod 字段定义
- **问题描述**：新建管理员、重置管理员密码、管理员自助修改密码三处的最低密码长度都是 8 位，低于本次基线要求的 10 位。
- **实际证据**：修复前三处均为 `z.string().min(8, '...8 位')`；对应的后台前端表单（`AdminUserForm.tsx`、`ResetPasswordForm.tsx`、`ChangePasswordForm.tsx`）也都用 `minLength={8}` 和"至少 8 位"提示文案，与服务端一致。
- **攻击或故障影响**：8 位密码理论上比 10 位更容易被离线爆破（虽然本项目用 Argon2id 加大了单次哈希成本，且有登录锁定挡在线爆破），属于基础防护偏弱而非可直接利用的漏洞。
- **是否已修复**：是。
- **修复方式**：三处服务端 schema 的 `min(8, ...)` 改为 `min(10, ...)`，对应错误文案同步更新为"至少 10 位"；三个前端表单的 `minLength`/提示文案同步改为 10，避免客户端允许提交 8 位密码、服务端却拒绝的体验落差。**登录时使用的 `loginSchema`（`backend/src/modules/auth/auth.schema.ts`）保持不变，只要求密码非空，不做长度校验**——已有单测明确验证一个 6 位的"历史密码"仍然可以通过 `loginSchema` 校验，保证现有管理员不会因为旧密码短于新规则而被锁在门外。未设置任何最大长度上限（新增/修改密码 schema 本来就没有 `.max()`），允许长口令、允许复制粘贴。
- **回滚方式**：`git revert` 对应 commit，或将三处 `min(10, ...)` 改回 `min(8, ...)`，前端三处 `minLength` 同步改回。回滚后不影响任何现有账号（无论回滚前后，都不会因为这次改动导致老密码失效）。

## 5. 本轮代码修改

| 文件 | 修改内容 | 是否影响现有管理员 | 是否影响生产数据 | 是否影响 Cookie | 是否影响权限 | 回滚方式 |
|---|---|---|---|---|---|---|
| `backend/src/config/env.ts` | 新增生产环境 JWT_SECRET 弱默认值拒绝启动的门禁（问题 #1） | 否——只在生产环境且 Secret 恰好是已知弱值时才会阻止启动，属于本该发生的行为 | 否 | 否 | 否 | 见问题 #1 |
| `backend/src/lib/secret-safety.ts`（新增） | 纯函数 `isWeakSecret`，供 `env.ts` 复用 | 否 | 否 | 否 | 否 | 删除该文件并去掉 `env.ts` 里的引用 |
| `backend/src/modules/admin-users/admin-users.schema.ts` | `createAdminUserSchema.password`、`resetPasswordSchema.newPassword` 最低长度 8→10（问题 #2） | 否——只影响"以后新建/重置密码时"的校验，不影响已有密码登录 | 否 | 否 | 否 | 改回 `min(8, ...)` |
| `backend/src/modules/account/account.schema.ts` | `changePasswordSchema.newPassword` 最低长度 8→10（问题 #2） | 同上 | 否 | 否 | 否 | 改回 `min(8, ...)` |
| `frontend/src/app/admin/(dashboard)/settings/admin-users/AdminUserForm.tsx` | `minLength`/提示文案 8→10，与服务端保持一致 | 否 | 否 | 否 | 否 | 改回 8 |
| `frontend/src/app/admin/(dashboard)/settings/admin-users/[id]/ResetPasswordForm.tsx` | 同上 | 否 | 否 | 否 | 否 | 改回 8 |
| `frontend/src/app/admin/(dashboard)/settings/account/ChangePasswordForm.tsx` | 同上 | 否 | 否 | 否 | 否 | 改回 8 |
| `backend/test/secret-safety.test.ts`（新增） | 5 个单测覆盖 `isWeakSecret` | 否 | 否 | 否 | 否 | 删除该文件 |
| `backend/test/password-policy.test.ts`（新增） | 8 个单测覆盖三处密码 schema 的边界值，以及登录 schema 不受影响 | 否 | 否 | 否 | 否 | 删除该文件 |

**没有修改**：Prisma schema、任何 migration、`.env`、`.env.example`、Docker 相关文件、Nginx 配置、管理员账号数据、产品/文章/页面/媒体/多语言/首页/About Us 等业务内容、任何非认证相关的依赖或代码。

## 6. 未处理事项

以下事项本次只记录，不在本轮实施，均不属于"当前必须完成"的阻塞项：

1. **Cookie 有效期 7 天，长于建议的 8-12 小时**。这是本项目早期一个刻意的架构决定（与 `JWT_EXPIRES_IN=7d` 同步，代码里有注释说明），对于一个由少数几个信任员工使用的普通企业站后台，7 天换取"不用频繁重新登录"的体验是合理取舍，且已有 `sessionVersion` 强制下线机制作为补充（管理员被停用/密码被重置/被强制下线时，7 天有效期内的旧 Cookie 会立刻失效，不需要等自然过期）。如果未来业务需要更严格的会话时长，可以单独调整，不需要现在处理。
2. **没有独立的 Origin/CSRF 校验中间件**。当前用 `SameSite=Lax` + 限定 CORS 白名单的组合已经满足本次基线"以下任一或组合"的要求，如果未来引入更复杂的跨域场景（比如允许第三方站点通过 iframe 嵌入后台），需要重新评估。
3. **前后端都没有单独的 `typecheck` npm script**。后端 `build`（`tsc -p tsconfig.json`）和前端 `build`（`next build`）本身都包含完整的 TypeScript 类型检查，本次审计已经跑过并且通过，不影响审计结论，但如果以后想要一个更快的"只查类型不出产物"的命令，可以补一个 `tsc --noEmit` 的 script。
4. **生产环境 Nginx/HTTPS 的真实配置未核实**。仓库自带的 `nginx/conf.d/default.conf` 只是一份可用于 Docker Compose 场景的参考配置，其中 HTTPS `server` 块以注释形式存在；据此前会话记录，生产站点的真实 HTTPS 终止由宝塔面板管理，不在这份仓库配置的范围内。本次审计按规则没有连接生产服务器核实实际生效的 Nginx/HTTPS 配置，建议下次有机会接触生产环境时单独核实一遍 `X-Forwarded-Proto`/HSTS 等头是否按预期生效。

**明确不需要现在做的**（按任务要求排除）：MFA、Passkey、WebAuthn、设备管理、异地登录检测、复杂风险评分、密码泄露库查询、OAuth 重构、大型认证框架接入。

## 7. 测试结果

| 测试或命令 | 是否执行 | 结果 | 退出码 | 说明 |
|---|---:|---|---:|---|
| `cd backend && npx tsc -p tsconfig.json --noEmit` | 是 | 通过 | 0 | 纯类型检查，不产出 dist |
| `cd backend && npm run lint`（`eslint . --ext .ts`） | 是 | 通过 | 0 | 无告警无错误 |
| `cd backend && npm test`（隔离临时数据库，含新增两个测试文件） | 是 | 通过 | 0 | 127/127（修复前 114，本轮新增 13 个：`secret-safety.test.ts` 5 个 + `password-policy.test.ts` 8 个） |
| `cd backend && npm run build`（`tsc -p tsconfig.json`） | 是 | 通过 | 0 | 正常编译到 `dist/` |
| `cd frontend && npm run lint`（`eslint`） | 是 | 通过 | 0 | 无告警无错误 |
| `cd frontend && npm test` | 是 | 通过 | 0 | 96/96（本轮未新增前端测试文件，前端改动仅为 `minLength`/文案，已有测试套件本身不针对这两处编写专项用例，改动风险极低，靠后端 schema 测试和人工代码审阅保证正确性） |
| `cd frontend && npm run build`（`next build`） | 是 | 通过 | 0 | 全量生产构建，含类型检查，无报错 |
| `typecheck`（独立 script） | 否 | — | — | 前后端 `package.json` 均未定义独立 `typecheck` script，`build` 命令本身包含完整类型检查（见上两行），未临时创建无关命令，详见第 6 节记录 |

## 8. 数据与部署影响

- **是否连接生产数据库**：否。
- **是否修改数据库**：否。
- **是否修改 Prisma**：否，`schema.prisma` 未改动。
- **是否执行 migration**：否。
- **是否执行 seed**：否。
- **是否修改 `.env`**：否。
- **是否修改 Docker**：否。
- **是否修改 Nginx**：否（只读查看了 `nginx/conf.d/default.conf`，未修改）。
- **是否 push**：否。
- **是否部署**：否，未登录生产服务器、未重启容器、未触发任何部署流程。

## 9. 最终结论

1. **当前后台是否存在公开注册**：不存在。
2. **密码是否安全存储**：是，Argon2id。
3. **Cookie 是否安全**：是，HttpOnly + 生产环境 Secure + SameSite=Lax + 明确 Path 和有效期。
4. **Token 是否进入 localStorage**：否，已核实并有单测覆盖。
5. **5 次失败锁定是否有效**：是，服务端持久化实现，且有专项单测覆盖多个维度和边界情况。
6. **15 分钟锁定是否有效**：是，滚动时间窗口实现，成功登录后正确清零。
7. **登录错误是否统一**：是，不存在的邮箱和密码错误返回完全相同的状态码与响应体，且做了时间侧信道防护。
8. **登录是否具备基础限速**：是，登录路由单独限速 5 次/分钟，叠加账号级三维度锁定。
9. **禁用账号是否真正失效**：是，登录时拒绝，且已登录的旧 Session 在账号被停用后会在下一次请求时立刻失效（服务端每次都重新查库，不是只信任 JWT 快照）。
10. **后台 API 是否有服务端权限保护**：是，全部受保护路由挂载统一的认证+角色中间件，权限矩阵单一事实源，前端菜单/按钮隐藏不作为唯一保护。
11. **登录日志是否泄露敏感信息**：否，密码/Token/Secret/Cookie 等字段在写入前统一按字段名过滤为 `[REDACTED]`，且有单测直接验证。
12. **是否存在硬编码 Secret**：不存在硬编码在源码里的真实生产 Secret；存在一个用于开发环境的、写在 `.env.example`/zod 默认值里的公开占位字符串，本轮已修复为"生产环境使用该占位值时拒绝启动"。
13. **当前是否达到普通企业独立站标准**：是（修复后）。
14. **是否需要立即实施 MFA**：否。
15. **是否需要大规模重构认证系统**：否。
16. **是否适合进入正常部署流程**：是，但建议部署前按问题 #1 的提醒确认生产环境 `JWT_SECRET` 已经是强随机值（本次审计规则不允许连接生产核实）。
