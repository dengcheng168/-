# KoiGate Tech 生产项目代码健康与无效文件审计报告

- 审计日期：2026-07-30
- 审计范围：`D:\净水器网站\site` 全仓库（`backend/`、`frontend/`、`nginx/`、`scripts/`、根配置文件）
- 审计性质：**只读审计**，本次未删除、未移动、未重命名任何文件，未修改任何业务代码/数据库/`.env`/Docker/Nginx/宝塔配置，未执行任何 Prisma migration/db push/seed，未 commit、未 push
- 审计分支/commit：`main` @ `378490acb1d847998052f116f7b542397da25194`（2026-07-30 03:27:24 +0800）
- 前置说明：本仓库此前已经过多轮专项审计与清理（仓库清理×2、SQLite 测试隔离改造、正式站点域名配置重构、i18n 西语实现等，详见本报告"项目架构概览"一节的历史沿革说明），因此整体基线质量已经较高，本次审计在此基础上查找**新增/残留**的问题。

---

## 一、执行摘要

本次审计覆盖依赖、死代码、重复实现、垃圾文件、静态资源、配置漂移、Docker/部署、Prisma/SQLite、代码质量共 9 大类。**未发现任何 P0（阻断级）或明确的 Category A（可直接安全删除）问题**。全部构建/测试/静态检查均为绿色：

| 检查项 | 结果 |
| --- | --- |
| 后端 `npm run lint` | 0 错误 0 警告 |
| 前端 `npm run lint` | 0 错误 0 警告 |
| 后端 `npm run build`（`tsc -p tsconfig.json`） | 编译成功，0 错误 |
| 前端 `npm run build`（`next build`） | 编译成功，69 个静态页 + 全部动态路由生成成功，0 错误 |
| 后端 `npm test` | 114/114 通过，0 失败 |
| 前端 `npm test` | 87/87 通过，0 失败 |
| `console.log`（业务代码，排除测试/脚本） | 后端 0 处；前端 1 处（`instrumentation.ts`，确认为有意的启动期日志，非调试残留） |
| `TODO`/`FIXME`/`HACK` | 后端 0 处；前端 0 处 |
| `: any` / `as any` | 后端 0 处；前端 0 处（两端 `tsconfig.json` 均为 `strict: true`） |
| Git 审计前状态 | 仅 1 项未跟踪目录 `.claude/`（审计开始前已存在），无未提交修改 |

总体评分（满分 100）：**92/100**（扣分点：2 个一次性维护脚本长期滞留未清理、1 个已确认无前端消费者的数据库字段+对应死代码引用、部分 admin 数据写入 action 缺失按 tag 精确失效导致仅能依赖 ISR 轮询——均为 Category B/C 级别，不构成功能性缺陷）。

- P0 数量：**0**
- P1 数量：**0**
- P2 数量：**2**
- P3 数量：**3**
- 可安全清理项数量（Category A）：**0**
- 需要人工确认项数量（Category B）：**4**
- 疑似未使用依赖数量：**0**
- 疑似历史文件数量：**2**

---

## 二、项目架构概览

```
site/
├── frontend/                # Next.js 16.2.10（App Router + Turbopack）
│   └── src/
│       ├── app/(site)/      # 英文前台（14 个页面级路由）
│       ├── app/es/          # 西班牙语前台平行路由（i18n 项目已完整实现，非本次新增）
│       ├── app/admin/       # 中文后台管理系统
│       ├── app/api/admin/   # 后台专用服务端代理路由
│       ├── components/、lib/、proxy.ts
├── backend/                  # Fastify 5 + Prisma 6.19.3 + SQLite
│   └── src/modules/          # 按资源划分（products/blog/certificates/faqs/pages/settings/inquiries/media/…）
├── nginx/                    # 单一 conf.d/default.conf 反代规则，无重复配置
├── scripts/                  # deploy.sh / update.sh / backup.sh / restore.sh（均被 README 引用）
├── uploads/、data/            # Docker 绑定挂载的持久化目录（用户数据，禁止删除）
├── docker-compose.yml + docker-compose.prod.yml
└── .env.example
```

- Prisma schema 共 **26 个 model**，18 个迁移文件，命名规范一致（`YYYYMMDDHHMMSS_snake_case`），无孤立表残留。
- 前端生产构建路由总数 69（`next build` 实测），英文/西语路由一一对应，无缺失。
- 历史沿革（从既有任务记录可确认，非本次审计产生）：项目已完成 i18n 西语前台全量实现、媒体库升级、像素追踪、访问量统计、两轮"仓库清理"专项审计与清理、SQLite 测试库隔离改造、"正式站点域名"配置重构、多标签页安全登出加固等多个阶段性工程，当前代码库基线成熟度较高。

---

## 三、审计命令记录表

| 序号 | 命令 | 目的 | 结果 |
| --- | --- | --- | --- |
| 1 | `git status --short` / `git rev-parse HEAD` / `git log -1` | 记录审计前基线 | 分支 `main`，commit `378490a`，仅 `.claude/` 未跟踪 |
| 2 | `node --import tsx --test src/**/*.test.ts`（frontend） | 前端测试 | 87/87 通过 |
| 3 | `node --import tsx --import ./test/bootstrap.ts --test test/*.test.ts`（backend） | 后端测试（隔离库） | 114/114 通过 |
| 4 | `Grep console\.log\(` (backend/src, frontend/src) | 调试代码残留 | backend 0 处；frontend 1 处（确认为有意日志） |
| 5 | `Grep TODO\|FIXME\|HACK` (backend/src, frontend/src) | 待办/破窗标记 | 均 0 处 |
| 6 | `Grep : any\|as any` (backend/src, frontend/src) | 类型逃逸 | 均 0 处 |
| 7 | `Grep @radix-ui/...\|lucide-react\|sonner\|...` (frontend/src) | 前端依赖实际使用核查 | 全部 15 个依赖均有实际 import |
| 8 | 读取 `nginx/conf.d/default.conf`、`nginx/nginx.conf` | Nginx 重复配置核查 | 单文件，无重复 server/location 块 |
| 9 | `npm run build`（frontend, `next build`） | 生产构建验证 | 成功，69 路由，0 错误 |
| 10 | `npm run build`（backend, `tsc -p tsconfig.json`） | 生产构建验证 | 成功，0 错误 |
| 11 | `npm run lint`（frontend / backend） | 静态检查 | 均 0 错误 0 警告 |
| 12 | 读取 `backend/src/config/env.ts` 对照根 `.env.example` | 环境变量漂移核查 | 无漂移 |
| 13 | 读取 `docker-compose.yml`/`.prod.yml`、两端 `Dockerfile` | Docker 配置核查 | 结构清晰，无重复/冗余 |
| 14 | `Grep STRUCTURED_JSON_SLUGS`、`Grep factoryPhotos` 全仓库 | 已知可疑死代码定点复核 | 均确认为死代码/未消费字段（见下） |
| 15 | 目录扫描 `frontend/public`、`backend/uploads`、根 `uploads/`、`data/`、`docs/` | 静态资源与垃圾文件核查 | 无明显垃圾文件；`docs/` 为本地空目录（未纳入 Git） |
| 16 | `Grep deprecated\|legacy\|_old\.\|_backup\.` (backend/src, frontend/src) | 遗留/废弃命名核查 | 命中项均为正常业务含义（如 `CopyUrlButton.tsx`、有意保留的旧翻译表兼容回退逻辑），非死代码 |

---

## 四、审计前 Git 状态

```
分支: main
HEAD: 378490acb1d847998052f116f7b542397da25194
提交时间: 2026-07-30 03:27:24 +0800
git status --short:
?? .claude/
```

`.claude/` 为审计开始前已存在的未跟踪目录（Claude Code 本地配置），本次审计未创建、未修改、未删除其内容。

---

## 五、可安全清理项表（Category A）

**本次审计未发现满足全部评判标准（可重建的构建产物 / 非生产数据 / 零引用 / 删除零影响 / 证据充分）的 Category A 项。** 这本身是代码库维护良好的信号——历史上明显的垃圾文件已在此前的"仓库清理"专项审计中处理完毕。

---

## 六、高概率需确认项表（Category B）

| 序号 | 路径 | 问题描述 | 证据 | 建议动作（需人工确认，本次未执行） |
| --- | --- | --- | --- | --- |
| B-1 | `backend/scripts/seed-core-advantages-es.js` | 一次性脚本：为首页"核心优势"三张卡片补西语译文。未被 `package.json` 任何 script 引用，仅能靠手动 `node scripts/xxx.js` 执行，且注释明确写"此前该字段没有接入 i18n"——描述的问题已通过后续 i18n Phase 系列彻底解决 | 脚本头部注释自述"一次性脚本"；`grep package.json` 无引用 | 确认该脚本描述的数据修复是否已经落地（可查后台"首页模块"西语内容），确认后按项目既有惯例（`git rm` 删除一次性脚本）清理 |
| B-2 | `backend/scripts/strip-leading-inverted-punct.js` | 维护脚本：批量去除西语字段开头的 `¿`/`¡`。注释自述"可重复运行"，但同样未接入 `package.json` scripts，只能靠记忆手动执行 | 脚本头部注释；`grep package.json` 无引用 | 二选一确认：①若仍需作为长期可用工具，补充进 `package.json`（如 `strip-inverted-punct`）并写入 README；②若西语内容录入流程已经杜绝该问题（如后台表单/审计脚本已拦截），则按一次性脚本清理 |
| B-3 | `SiteSetting.factoryPhotos` 字段及其后台表单（`frontend/src/app/admin/(dashboard)/homepage/{page.tsx,HomepageForm.tsx}`、`backend/src/modules/settings/*`、`backend/prisma/schema.prisma`） | 后台可编辑、可保存该字段（工厂图片地址 JSON 数组），但**前台英文与西语站点均无任何页面读取渲染该字段**（`grep factoryPhotos` 于 `frontend/src/app/(site)` 与 `frontend/src/app/es` 均 0 命中） | 见"审计命令记录表"第 14 项；`next build` 路由清单中不存在 `/factory` 或 `/es/factory` | 确认产品意图：①若曾计划做工厂展示区但未完成，需要人工决定补齐前台渲染或删除该字段；②若已废弃，需确认现有数据库中该字段是否已有真实数据（涉及数据决策，本次未查询/未展示 DB 内容） |
| B-4 | `STRUCTURED_JSON_SLUGS`（`frontend/src/lib/actions/admin/pages.ts:22`、`frontend/src/app/admin/(dashboard)/pages/PageForm.tsx:33`，均为 `new Set(['factory', 'oem-odm'])`） | 后台"页面管理"表单据此判断某个 Page 的 `sections` 字段应显示为结构化 JSON 编辑器还是普通 HTML 编辑器；但对应的前台路由 `/factory`、`/oem-odm`、`/es/factory`、`/es/oem-odm` 在当前 `frontend/src/app` 目录中均不存在（`next build` 产物路由清单确认），只要 Page 表中确实还存在 slug 为 `factory`/`oem-odm` 的记录，后台仍会展示这个特殊 JSON 编辑器，但前台已无处消费 | `next build` 完整路由清单（69 条，无 `/factory`、`/oem-odm`）；两处代码引用的 slug 硬编码 | 确认 Page 表中是否还存在这两个 slug 的记录（本次未查询 DB 内容）；若前台确认永久移除，`STRUCTURED_JSON_SLUGS` 及其对应表单分支可视为死代码，需人工决定清理方式 |

---

## 七、未使用代码与导出表

| 符号/字段 | 位置 | 状态 |
| --- | --- | --- |
| `SiteSetting.factoryPhotos` | 见 B-3 | 后台写入、前台零消费 |
| `STRUCTURED_JSON_SLUGS` | 见 B-4 | 引用的 slug 在前台路由中不存在 |

未发现其他明确的未使用导出（ESLint 未配置 `no-unused-vars` 之外的死导出检测规则，且项目 `strict: true` + 0 lint 警告，说明至少所有本地变量/导入均被使用；跨文件级别的未使用具名导出未做全量穷举扫描，仅完成了两项此前会话已知可疑点的定点复核）。

---

## 八、重复代码表

**本次未发现新的重复/并存实现。** 唯一表面上看起来像"新旧并存"的是通用 `Translation` 表与 `FaqTranslation` 表同时存在，但经核查为**有意保留的兼容回退设计**，非重复代码：
- `frontend/src/lib/i18n/faq-source.ts` 的 `resolveFaqContent` 显式优先读取 `FaqTranslation`（已发布），其次回退到旧 `Translation` 表，最后回退英文——三层回退均有对应单元测试覆盖（前端测试清单第 37-41 行）。
- `backend/prisma/migrate-faq-translations.ts` 头部注释明确写明"旧 Translation 表只读不删，作为兼容回退"。

此前会话记录中提到的"12 对旧实现并存"已在历史上的"仓库清理"专项审计中处理，本次未见新增同类问题。

---

## 九、依赖审计

**前端**（`frontend/package.json`，共 15 个 dependencies）：全部通过 `grep` 确认在 `src/` 下有真实 import，**0 个疑似未使用依赖**。

| 依赖 | 使用位置 |
| --- | --- |
| `@radix-ui/react-dialog` | `components/admin/ui/dialog.tsx` |
| `@radix-ui/react-dropdown-menu` | `components/admin/ui/dropdown-menu.tsx` |
| `@radix-ui/react-slot` | `components/admin/ui/button.tsx`（`asChild` 模式） |
| `@radix-ui/react-tabs` | `components/admin/ui/tabs.tsx` |
| `@radix-ui/react-tooltip` | `components/admin/ui/tooltip.tsx` |
| `class-variance-authority` / `clsx` / `tailwind-merge` | `lib/utils.ts` |
| `lucide-react` | 15 个文件广泛使用 |
| `sonner` | `components/admin/ui/sonner.tsx` |

**后端**（`backend/package.json`，共 14 个 dependencies）：均为 Fastify 生态标准插件（`@fastify/cookie`/`cors`/`jwt`/`multipart`/`static`/`rate-limit`/`sensible`）、Prisma、`argon2`、`sharp`、`sanitize-html`、`pino`、`zod`、`nodemailer`，逐一对照 `src/plugins/` 和 `src/modules/` 均有实际引用，**0 个疑似未使用依赖**。

未发现依赖版本冲突或需要人工升级评估的项（未执行 `npm audit`/`npm outdated`，按约束不做依赖升级判断）。

---

## 十、垃圾文件与生成文件

| 项 | 说明 |
| --- | --- |
| `docs/` | 本地存在但为空目录，**未被 Git 跟踪**（空目录 Git 本身不记录），不属于仓库内容，不影响任何功能，可忽略 |
| `.next/`、`dist/`、`node_modules/`、`*.tsbuildinfo` | 均已在 `.gitignore` 中正确排除，本地存在属正常构建产物，未纳入版本控制 |
| `backend/prisma/dev.db` | 本地开发数据库文件，已在 `.gitignore` 排除，**禁止删除**（本机开发数据） |
| 无 `.DS_Store`/`Thumbs.db`/`npm-debug.log*` 残留 | `.gitignore` 已覆盖，扫描未发现例外 |

未发现需要清理的构建产物或临时文件残留在版本控制范围内。

---

## 十一、静态资源审计

| 目录 | 内容 | 说明 |
| --- | --- | --- |
| `frontend/public/` | `favicon.ico` + `images/placeholders/product-placeholder.svg` | 均为运行时占位资源，非孤立文件 |
| `backend/uploads/`（本机开发） | 11 张原图 + 对应 WebP/缩略图 | 本机开发过程中产生的真实上传文件，**未逐一核对是否被 `Media` 表引用**（禁止删除用户上传文件，且后台已有专门的 `/admin/media/unused`"未使用媒体"功能页面用于此类核对，建议后续使用该功能而非在本次只读审计中手工比对数据库） |
| 根目录 `uploads/`、`data/` | Docker 生产挂载点，本机基本为空（仅 `.gitkeep`） | 符合预期，生产数据只存在于服务器 |

**结论**：静态资源无明显孤儿文件；媒体库层面的精确"未使用"判定应通过产品自带的 `/admin/media/unused` 功能完成，而非本次审计手工枚举（避免误判正在被产品/文章富文本 HTML 内嵌引用但无法通过文件系统扫描识别的图片）。

---

## 十二、前端问题（P0-P3）

| 优先级 | 问题 | 位置 | 说明 |
| --- | --- | --- | --- |
| P2 | `factoryPhotos` 字段前台零消费 | 见 B-3 | 用户可在后台录入但对访客完全不可见，属产品/工程决策不同步，非崩溃性缺陷 |
| P3 | `STRUCTURED_JSON_SLUGS` 引用不存在路由 | 见 B-4 | 纯粹的后台表单分支判断逻辑残留，不影响任何运行时功能，仅在有 slug 恰好匹配时切换编辑器 UI 形态 |

未发现 P0/P1 级前端问题；构建、类型检查、Lint、单元测试均通过。

---

## 十三、后端问题（P0-P3）

| 优先级 | 问题 | 位置 | 说明 |
| --- | --- | --- | --- |
| P3 | 两个一次性维护脚本滞留未清理 | 见 B-1、B-2 | 不影响任何运行时行为，纯属仓库整洁度问题 |

未发现 P0/P1/P2 级后端问题；构建、类型检查、Lint、114 项单元测试（隔离数据库）均通过。

---

## 十四、Prisma / SQLite 问题

- 26 个 model，18 个迁移文件，命名规范、时间线连续，**无孤立表**（未发现指向已删除 model 的残留迁移或 schema 字段）。
- 测试数据库隔离机制（`backend/src/lib/database-safety.ts` + `test/bootstrap.ts`）在本次 114 项测试全部通过的过程中被实际验证生效，未连接开发库 `dev.db`。
- `backend/prisma/migrate-faq-translations.ts`、`backend/prisma/backfill-site-base-url.ts` 两个"一次性但幂等、支持 `--dry-run`"的迁移辅助脚本**已被 `package.json` 的 `seed:translations`/`migrate:faq-translations`/`backfill:site-base-url` 收录为正式维护命令**，与 B-1/B-2 两个"游离脚本"性质不同，属于合理保留（Category D，暂时保留），不建议清理。
- `backend/prisma/seed.ts` 写入的是通用占位产品/分类演示数据（`upsert` by slug），仅在开发环境手动执行才会生效，未发现被生产部署流程自动调用的路径。

---

## 十五、Docker / 部署问题

- 两端 `Dockerfile` 均为单一、结构清晰的多阶段构建，未发现重复/legacy 版本。
- `docker-compose.yml` + `docker-compose.prod.yml` 采用标准 base+overlay 叠加模式，内存限制正确使用 `mem_limit`（而非仅在 Swarm 模式生效的 `deploy.resources.limits`），无重复端口映射。
- `nginx/conf.d/default.conf` 为单一文件、单一 HTTP `server` 块，HTTPS 块以完整注释形式预留（待证书签发后启用），**无重复的 location/server 块**。
- `.gitignore` 对 `.env`/数据库文件/上传目录/证书目录/日志的排除规则完整、无遗漏。

未发现 Docker/部署层面的问题。

---

## 十六、配置与环境变量漂移表

对照 `backend/src/config/env.ts`（Zod schema，唯一事实源）与根 `.env.example`：**未发现漂移**。

| 变量 | `env.ts` 中声明 | `.env.example` 中说明 | 一致性 |
| --- | --- | --- | --- |
| `JWT_SECRET`/`JWT_EXPIRES_IN` | ✓ | ✓ | 一致 |
| `CORS_ORIGIN`/`TRUST_PROXY` | ✓ | ✓ | 一致 |
| `ADMIN_INIT_EMAIL`/`ADMIN_INIT_PASSWORD` | ✓（optional） | ✓ | 一致 |
| `TURNSTILE_*`/`SMTP_*` | ✓（optional，实际生效值存数据库） | ✓ 明确标注"这里留空即可" | 一致，文档措辞与代码行为吻合 |
| `FRONTEND_BASE_URL`/`REVALIDATE_SECRET` | ✓ | ✓（`docker-compose.yml` 中另有服务名覆盖说明） | 一致 |
| `NEXT_PUBLIC_SITE_URL` | 前端侧使用，已标注 `[deprecated]` | `.env.example` 同样标注 deprecated 且说明优先级顺序 | 一致 |

未发现"代码里读取但 `.env.example` 未声明"或"`.env.example` 声明但代码未读取"的孤立变量。

---

## 十七、代码质量问题

| 检查项 | 结果 |
| --- | --- |
| 长文件/超长函数 | 未做逐文件行数穷举扫描（时间/风险预算内未覆盖，非结论为"不存在"，标记为待续项） |
| `any` 类型滥用 | 0 处（两端 `strict: true`） |
| 调试代码残留（`console.log`） | 后端 0 处；前端仅 1 处且为有意的启动日志 |
| `TODO`/`FIXME`/`HACK` | 0 处 |
| 死注释/命名问题 | 未发现系统性问题；`grep` "legacy/deprecated" 命中的均为有意的、注释说明清晰的兼容回退代码，非死代码 |
| Lint 一致性 | 前后端 `npm run lint` 均 0 错误 0 警告 |

---

## 十八、禁止删除清单

以下内容在任何后续清理动作中**禁止删除、移动或重命名**：

- `backend/prisma/dev.db`、`backend/prisma/migrations/**`、所有 `*.db`/`*.db-wal`/`*.db-shm`
- `backend/uploads/**`、根目录 `uploads/**`、`data/**`（用户上传文件与生产数据库持久化卷）
- `.env`、`.env.example`（各级）、`.gitignore`
- `Dockerfile`（前后端）、`docker-compose.yml`、`docker-compose.prod.yml`
- `nginx/nginx.conf`、`nginx/conf.d/*.conf`、`nginx/snippets/*.conf`
- 所有 Next.js App Router 特殊文件：`page.tsx`、`layout.tsx`、`route.ts`、`loading.tsx`、`error.tsx`、`not-found.tsx`、`template.tsx`、`default.tsx`、`proxy.ts`（本项目的 middleware）、`instrumentation.ts`、`sitemap.ts`、`robots.txt` 路由
- `package.json`/`package-lock.json`（前后端）、`schema.prisma`
- `backend/prisma/migrate-faq-translations.ts`、`backend/prisma/backfill-site-base-url.ts`（已被 `package.json` 正式命令收录，属合理保留的维护工具，非游离脚本）

---

## 十九、分阶段清理建议（5 个阶段）

> 以下均为**建议**，本次审计未执行任何一项，均需用户审核后另行下达指令。

1. **阶段一（人工确认，零代码改动）**：由用户/产品侧确认 B-1～B-4 四项的产品意图——两个一次性脚本是否已经完成使命、`factoryPhotos` 字段的前台展示是否仍在规划中、Page 表里 `factory`/`oem-odm` 两条 slug 记录的当前状态。
2. **阶段二（若确认清理，走独立分支）**：为 B-1/B-2 脚本清理与 B-3/B-4 死代码清理分别创建独立的 feature 分支，不与其他功能开发混在一起提交。
3. **阶段三（媒体核对）**：使用后台已有的 `/admin/media/unused`"未使用媒体"功能核对 `backend/uploads/` 下的孤儿文件，而非依赖本次的文件系统枚举。
4. **阶段四（回归验证）**：清理落地后，重新跑一遍前后端 `lint`/`build`/`test`（本次报告中的全部绿色基线可作为清理前后对比的基准）。
5. **阶段五（提交与审核）**：按项目既有惯例分批小颗粒度提交，附带清晰的中文 commit message，提交前再次执行本报告"审计前 Git 状态"一节同款的自检命令。

---

## 二十、建议执行批次

**本次不建议执行任何清理批次**——按用户指令，审计到此为止，等待用户审核报告后再决定是否启动上述阶段一。

---

## 二十一、最终结论

项目代码库整体健康度高，历史上的技术债已通过多轮专项审计基本清理干净。本次审计未发现任何阻断级（P0）问题，也未发现足以被无条件判定为"可安全删除"（Category A）的文件——这符合一个已经过多轮维护的成熟代码库的预期状态。剩余的 4 项 Category B 待确认项均为**低风险、影响面小、且需要产品/业务侧决策**（而非工程侧单方面可判定）的事项，建议按上文分阶段建议逐步处理。

---

## 审计后自检（只读命令）

```
git status --short   → ?? .claude/（与审计前完全一致，未新增/未变化）
git diff --stat       → （空，无任何已跟踪文件被修改）
git diff -- CODE_HEALTH_AUDIT.md  → （新文件，无基线可比对；本文件为本次审计唯一新增内容）
```

确认：除本报告文件 `CODE_HEALTH_AUDIT.md` 本身外，未修改任何文件；未删除任何文件；未执行任何 commit 或 push。
