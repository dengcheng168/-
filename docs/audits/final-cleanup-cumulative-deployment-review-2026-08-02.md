# 最终代码清理分支累计差异与部署安全审计 — 2026-08-02

只读审计。本报告是本轮唯一产出，未修改任何源码、Prisma schema、测试或部署配置，未执行 migration/seed，未 commit，未 push，未连接生产数据库。

## 1. 执行摘要

- 生产基线：`1a67421d30dbfa8a89c702d27528b1831e3aed7d`
- 分支 HEAD：`e30762070d9de104b383a9984df8faefc567e177`（分支 `chore/final-code-cleanup-2026-08-02`）
- 完整提交数量（`1a67421..e307620`）：**2**
- 累计修改文件数：2（均为 Prisma 种子脚本源码）
- 累计新增文件数：1（本轮之前写的审计文档）
- 累计删除文件数：0
- 是否存在 Prisma 变化：**否**（`schema.prisma` 与 `migrations/` 目录在此范围内均无 diff）
- 是否存在 migration：范围内无新增/变更 migration；此前提交 `50a5d9e`（生产基线的祖先提交，非本分支增量）含一个已随生产基线一并部署的 migration，详见第 4/7 节
- 是否需要 migration：**否**（本分支相对生产基线不需要执行任何新 migration）
- 是否需要 seed：**否**（本分支改动仅是种子脚本源码，未执行、不影响现有数据）
- 是否存在部署阻塞项：**否**
- 最终是否建议部署：**是**（风险等级：低，可安全合并部署；具体见第 11 节）

## 2. 完整提交列表

| SHA | 标题 | 文件范围 | 主要行为 | 风险 |
|---|---|---|---|---|
| `b21526f` | docs(audit): document final code cleanup | 新增 1 个文档文件 | 撰写清理审计报告，纯文档，无代码改动 | 无风险 |
| `e307620` | chore(seed): remove retired /factory and /oem-odm entries from seed data | 修改 2 个 Prisma 种子脚本 | 从 `seed.ts`/`seed-translations.ts` 中删除指向已退役路由 `/factory`、`/oem-odm` 的 `NavigationItem`/`Page`/翻译条目；两脚本均未执行 | 极低（脚本源码编辑，不参与运行时，未执行） |

对每个提交的详细字段：

**`b21526f`**
- 修改文件数：1（新增）｜新增文件：`docs/audits/final-code-cleanup-2026-08-02.md`｜删除文件：0
- 是否修改 Prisma：否｜是否修改数据库相关代码：否｜是否修改前端路由：否｜是否修改后台表单：否｜是否修改 seed：否｜是否修改测试：否｜是否修改部署文件：否
- 风险等级：无（纯文档）

**`e307620`**
- 修改文件数：2｜新增文件：0｜删除文件：0
- 是否修改 Prisma：否（seed 脚本不是 schema/migration）｜是否修改数据库相关代码：是，但仅限种子脚本源码，未执行｜是否修改前端路由：否｜是否修改后台表单：否｜是否修改 seed：是（本提交本身就是 seed 脚本编辑）｜是否修改测试：否｜是否修改部署文件：否
- 风险等级：极低

## 3. 完整累计差异审查

`git diff --stat 1a67421..e307620`：
```
 backend/prisma/seed-translations.ts          | 25 --------
 backend/prisma/seed.ts                       | 38 ++----------
 docs/audits/final-code-cleanup-2026-08-02.md | 92 ++++++++++++++++++++++++++++
 3 files changed, 97 insertions(+), 58 deletions(-)
```

`git diff --name-status 1a67421..e307620`：
```
M	backend/prisma/seed-translations.ts
M	backend/prisma/seed.ts
A	docs/audits/final-code-cleanup-2026-08-02.md
```

`git diff --summary 1a67421..e307620`：仅 1 条 `create mode 100644`（新增文档），无重命名、无权限变化、无二进制文件变化。

按分类整理（累计范围内，全部 14 类逐一核对）：

| 类别 | 结果 |
|---|---|
| 1. 删除的源码文件 | 无 |
| 2. 修改的源码文件 | `backend/prisma/seed.ts`、`backend/prisma/seed-translations.ts`（均为一次性种子脚本，非运行时代码） |
| 3. 新增的源码文件 | 无（仅新增 1 个文档） |
| 4. Prisma schema 变化 | 无 |
| 5. migration 变化 | 无 |
| 6. seed 变化 | 有，见上（仅删除指向已退役路由的条目） |
| 7. 后台功能变化 | 无 |
| 8. 前台功能变化 | 无 |
| 9. 路由变化 | 无（`/factory`、`/oem-odm` 本就不在当前路由树中，seed 修改只影响假设性的"全新环境初始化"数据，不产生路由变化） |
| 10. 静态资源变化 | 无 |
| 11. 测试变化 | 无 |
| 12. 文档变化 | 新增 `docs/audits/final-code-cleanup-2026-08-02.md` |
| 13. Docker/Nginx/部署变化 | 无 |
| 14. package.json 和锁文件变化 | 无 |

**结论：本分支相对生产基线的累计增量极小且低风险——只有种子脚本源码编辑和一份新文档，没有任何触及运行时行为、数据库结构或部署配置的改动。**

## 4. 50a5d9e 专项结论

**重要说明：`50a5d9e` 不属于 `1a67421..e307620` 这个增量范围** —— 它是生产基线 `1a67421` 的祖先提交（`git log` 确认顺序为 `50a5d9e → 7765944 → 6f3d2ac → 5d731ba → cc71d81 → da72322 → 66dc973 → 1a67421`），即该提交早已随生产基线一起完成过部署流程。本节按任务要求仍完整审查其内容，但结论不影响"本分支是否可部署"的判断——它已经是当前生产运行中代码的一部分。

`git show --stat --summary 50a5d9e`：18 个文件变更，54 行新增 / 271 行删除，新增 1 个 migration 文件，删除 5 个组件文件。

### 4.1 factoryPhotos

逐项核对：

- Prisma schema 中的字段是否被删除：**是**（`backend/prisma/schema.prisma` 中 `SiteSetting` 模型不再有 `stats`/`oemProcessSteps`/`factoryStats`/`factoryPhotos`/`partnerRegions` 五个字段）
- 是否存在对应 migration：**是**，`backend/prisma/migrations/20260802002000_remove_unused_homepage_json_fields/migration.sql`
- 是否修改 SiteSetting 类型：是（`frontend/src/types/settings.ts` 同步移除）
- 是否修改后端 schema：是（`backend/src/modules/settings/settings.schema.ts` 移除对应 zod 校验）
- 是否修改 API 响应：是（`JSON_FIELDS` 常量、`settings.service.ts` 序列化逻辑同步移除）
- 是否修改后台表单：是（`HomepageForm.tsx`、`homepage/page.tsx`、`updateHomepageSettingsAction` 移除对应输入）
- 是否修改 seed：是（`seed.ts` 移除 5 个字段的默认值）
- 是否修改测试：是（`jsonld.test.ts` mock 同步移除对应字段）
- 是否存在剩余引用：**否**（本轮已用 Grep 对 `frontend/src` 和 `backend/src` 全量搜索 `factoryPhotos|factoryStats|oemProcessSteps|partnerRegions|FactoryStrength|OemProcess|StatsCounter|CountUpValue|GlobalPartners`，0 命中）
- 当前代码保存 SiteSetting 时是否正常：是（`JSON_FIELDS`/schema/DB 列三者一致，无缺字段导致的序列化错误风险）
- 生产数据库保留旧列时是否兼容：不适用——见下方 migration 应用情况分析，旧列本身已在生产库物理层面被移除
- 部署是否需要数据库 migration：**不需要**——该 migration 已随生产基线部署完成（见下方分析），本分支不新增任何 migration 需求
- 如果不执行 migration，代码是否仍能正常运行：能（即使假设旧列仍物理存在，Prisma Client 按新 schema 生成，只是不再 SELECT/INSERT 这 5 列，SQLite 不会因为表里多出未声明的列而报错）
- 是否存在 Prisma Client 查询旧字段导致错误：否，当前代码库任何位置都不再引用这 5 个字段
- 是否存在整对象序列化或反序列化问题：否，`settings.service.ts` 的 `patchSettings` 对未在 `JSON_FIELDS`（现为 `['socialLinks','coreAdvantages','footerColumns']`）中的字段不会处理，不存在因缺字段导致的整对象覆盖风险

**migration 是否已应用到生产数据库的判定依据（不连接生产数据库，仅基于代码与此前会话中已观察到的事实）：**
`backend/Dockerfile` 第 43 行 `CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]` —— 每次后端容器启动都会先自动执行 `prisma migrate deploy`，若迁移失败该命令会以非零退出码短路，`node dist/server.js` 不会启动，容器健康检查必然失败。在本次审计的上一个会话任务（生产部署，产线基线从 `da72322` 快进到 `1a67421`）中，已经**实际观察到**重建后的 `backend` 容器进入 `Up ... (healthy)` 状态——而 `1a67421` 所构建的镜像已经包含 `50a5d9e` 引入的这个 migration 文件。容器能够进入健康状态，逻辑上唯一的解释是该次（或更早一次）`prisma migrate deploy` 已经成功执行并应用了这个 migration（否则容器根本不会进入 running/healthy 状态）。

**分类判定：属于第 3 类——"已有 migration 删除生产数据库列，且有强证据表明已随此前部署周期在生产数据库执行成功"。不属于第 4/5 类，不构成部署阻塞。**

### 4.2 五个未接线组件

逐一确认（均已在 `50a5d9e` 中通过 `git show --name-status` 确认为 `D`删除状态）：

| 组件 | 当前代码是否仍有 import | barrel export 残留 | CSS 残留 | 图片残留 | 测试残留 | 动态 import 残留 | 是否曾被真实路由覆盖 | 删除是否改变当前正式首页/About Us |
|---|---|---|---|---|---|---|---|---|
| FactoryStrength | 否 | 否 | 否（组件用 Tailwind 内联类，无独立 CSS 文件） | 否 | 否 | 否 | 从未被任何路由引用 | 否（首页从未渲染过它） |
| OemProcess | 否 | 否 | 否 | 否 | 否 | 否 | 从未被引用 | 否 |
| StatsCounter | 否 | 否 | 否 | 否 | 否 | 否 | 从未被引用 | 否 |
| CountUpValue | 否 | 否 | 否 | 否 | 否 | 否 | 仅是 StatsCounter 的内部 helper，随其一并删除 | 否 |
| GlobalPartners | 否 | 否 | 否 | 否 | 否 | 否 | 从未被引用 | 否 |

本轮用 Grep 对 `frontend/src` 全量搜索这 5 个组件名，0 命中，确认无任何残留引用、无孤儿 barrel export。

## 5. Prisma 与 SQLite 兼容结论

1. 从生产基线到当前 HEAD，Prisma schema 是否变化：**否**（`git diff 1a67421..e307620 -- backend/prisma/schema.prisma` 为空）
2. 是否存在 migration：本分支增量范围内**无**；生产基线本身已包含全部既有 migration（含 `50a5d9e` 引入的一个）
3. 部署是否需要执行 migration：**不需要**——`schema.prisma` 无变化，无新迁移文件产生
4. 不执行 migration 是否安全：安全（因为本来就没有待执行的新 migration；容器启动时的 `prisma migrate deploy` 是幂等操作，重复执行不会有副作用）
5. 生产数据库旧列存在是否会影响当前 Prisma：不适用，该问题属于 `50a5d9e`（已并入生产基线）的历史范畴，且已有强证据表明该 migration 已成功应用（见第 4.1 节）
6. 当前代码是否会写入或读取已删除字段：否，Grep 全量确认无引用
7. 是否存在数据丢失风险：**本分支自身（`1a67421..e307620`）不存在任何数据丢失风险**——两个改动的文件都是未执行的种子脚本源码
8. 是否可以保证本次部署不修改生产数据库：**可以保证**——本分支不含任何 schema/migration 变化，且 seed 脚本不会在容器启动流程中被自动调用（详见第 6 节）

## 6. seed 修改结论

逐项核对：

- 本轮删除的 factory/oem-odm 条目只影响未来新数据库初始化：**是**，`seed.ts`/`seed-translations.ts` 只在显式执行 `npm run seed` / `npm run seed:translations` 时才会运行
- 不影响现有生产数据库：**是**，脚本未被执行，生产数据库中已存在的历史 `NavigationItem`/`Page` 记录（如果当年真的种过 factory/oem-odm 记录）不受本次源码编辑影响，需要单独的数据清理操作（不在本轮范围内，也未执行）
- 不会在应用启动时自动执行：**确认**——`backend/Dockerfile` 的 `CMD` 只有 `npx prisma migrate deploy && node dist/server.js`，不含 `seed`
- Docker CMD 或启动脚本不会执行 seed：**确认**，见上
- `deploy.sh`、`update.sh` 不会自动执行 seed：已用 Grep 复核 `scripts/deploy.sh` 和 `scripts/update.sh`，均无 `seed` 调用
- `package.json` production scripts 不会自动执行 seed：确认，`backend/package.json` 的 `seed`/`seed:translations` 是独立、需手动调用的 script，不被 `start`/`build` 等其他 script 间接调用
- 不会删除生产数据库中的历史 Page 或导航记录：**确认**，本轮改动是纯源码编辑，从未连接、从未执行

**确认本次（假设的）部署明确不需要执行 seed。**

## 7. 正式网站行为核对

基于当前代码（不依赖运行时验证，因本轮不允许启动服务/连接生产库），确认以下功能的实现代码均完整存在、未受本分支改动触及：

英语首页、西班牙语首页、Products、About Us、Certificates、Blog、Contact、Privacy Policy、Terms of Use、后台首页管理、产品管理、多语言管理、管理员登录和权限——以上全部功能对应的路由文件、组件、API 均在 `1a67421..e307620` 的 diff 范围之外，逐一核对 `git diff --name-status` 结果（仅 3 个文件变化，均非这些功能的实现文件）即可确认零touch。

确认以下路由没有恢复：`/factory`、`/oem-odm`、`/es/factory`、`/es/oem-odm`——`frontend/src/app` 目录下无对应目录/文件（`Glob` 复核 0 命中），`seed.ts` 的改动是**删除**指向它们的条目而非恢复。

确认未删除当前正式页面需要的任何组件、类型、图片或数据查询——本分支未删除任何源码文件（第 3 节已确认"删除的源码文件：无"）。

## 8. 测试与构建结果复核

本轮重新独立执行（未使用 `--fix`）：

| 项目 | 结果 |
|---|---|
| frontend lint | 通过，0 警告/错误 |
| backend lint | 通过，0 警告/错误 |
| frontend test | 96/96 通过 |
| backend test | 127/127 通过 |
| frontend build | 通过，路由清单确认无 `/factory`、`/oem-odm` |
| backend build | 通过 |

与此前一轮清理任务记录的结果完全一致（无回归）。

## 9. 预存在 tsc 错误

`frontend` 执行 `npx tsc --noEmit` 会报 1 个错误：`src/lib/seo/jsonld.test.ts(55,7): error TS2741: Property 'companyMapImage' is missing...`。

- 确认该错误在生产基线 `1a67421` 上同样存在：**是**——`jsonld.test.ts` 未出现在 `git diff --name-status 1a67421..e307620` 的文件列表中（该范围内只有 `backend/prisma/seed.ts`、`backend/prisma/seed-translations.ts`、新增的审计文档三个文件），文件内容自基线以来逐字节未变，错误必然与基线时完全相同
- 确认错误不由 `1a67421..e307620` 的差异引入：**确认，非本分支引入**
- 记录为预存在的非阻塞问题：是（`npm run build`/`npm test` 均不受此类型检查错误影响而正常通过，说明它不阻塞实际构建和测试流程，只在严格的 `tsc --noEmit` 独立调用时才会报出）
- 本轮未修复，未修改测试配置

## 10. 部署风险分类

### A. 可以安全部署
- `e307620`（seed 脚本源码编辑）——无行为变化，无数据库风险，测试全部通过

### B. 可以部署但需部署后验证
- 无（本分支没有任何需要"部署后额外验证"的项——因为 seed 脚本根本不会在部署流程中被执行）

### C. 需要先修正再部署
- 无

### D. 不应部署
- 无

**累计范围内（含已并入基线的 `50a5d9e`）额外说明**：`50a5d9e` 引入的 5 字段删除+组件删除已经在生产环境完成并验证健康，不需要在本次判断中重新归类为待部署风险项。

## 11. 部署与回滚建议

- 是否可以直接合并到 main：**可以**（低风险，累计增量仅为 2 个种子脚本文件的源码编辑与 1 份文档）
- 是否可以直接部署：**可以**（前端/后端构建、lint、测试全部通过；不涉及运行时代码路径）
- 是否需要 migration：**否**
- 是否需要备份数据库：常规建议仍按项目既定流程在任何生产部署前创建数据库备份（属于标准作业程序，与本分支的低风险程度无关，是否执行按业务方部署流程惯例决定），但**本分支本身不产生任何数据库写操作**，即使跳过备份也不会因为本分支的改动而产生数据风险
- 是否需要修改数据库：**否**
- 部署失败时回滚到哪个 SHA：`1a67421d30dbfa8a89c702d27528b1831e3aed7d`（当前生产基线，回滚只需还原容器镜像/代码，无需任何数据库回滚操作，因为本分支未执行过 migration/seed）
- 是否需要保留当前数据库备份：按标准流程保留即可，非本分支特有要求
