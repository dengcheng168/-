# 生产项目三个审计问题 — 第二阶段只读确认报告

- 确认日期：2026-07-30
- 基线来源：`CODE_HEALTH_AUDIT.md`（第一阶段审计）
- 审计性质：**只读确认**，本次未修改业务代码、未修改数据库、未修改 Prisma schema/migration、未删除/移动/重命名任何文件、未修改 `package.json`/锁文件/`.env`/Docker/Nginx/部署配置、未执行两个待确认脚本、未 commit、未 push、未重启或重新部署任何服务。
- 重要说明：本报告中涉及的数据库读取（Page/NavigationItem/Translation 记录是否存在），**全部只针对本机开发数据库 `backend/prisma/dev.db` 执行严格只读查询**（仅 `findMany`/`select` 极少数字段：slug/是否存在/数量/label/url/visible/key，未读取、未输出任何正文、SEO 内容、JSON 内容或其他业务数据），**未连接、未查询生产数据库**。生产库上的实际情况可能与本机开发库不同，需用户在后台或服务器上另行核实。

---

## 一、执行摘要

| 项 | 结果 |
| --- | --- |
| 基线 commit | `378490acb1d847998052f116f7b542397da25194` |
| 当前 commit | `378490acb1d847998052f116f7b542397da25194`（未变化） |
| 是否发生代码漂移 | 否 |
| 是否修改业务代码 | 否 |
| 是否修改数据库 | 否（仅执行 `SELECT` 级别只读查询，针对本机开发库） |
| 是否执行两个脚本 | 否 |
| 三个核心问题的最终分类 | 见下表 |
| 推荐进入整改的问题数量 | 3 / 3（均建议进入下一阶段，但风险和紧急度不同，详见"六、建议整改批次"） |

| 问题 | 最终分类 | 置信度 |
| --- | --- | --- |
| `factoryPhotos` | **A. 后台孤儿字段**（曾被消费，2026-07-29 因页面删除而变孤儿） | 高 |
| `factory` slug | **B. 旧路由残留，可以从常量中移除**（叠加：后台 Page 记录与隐藏导航项残留） | 高 |
| `oem-odm` slug | **B. 旧路由残留，可以从常量中移除**（叠加：后台 Page 记录与隐藏导航项残留） | 高 |
| `seed-core-advantages-es.js` | **A. 已完成使命，可以删除** | 高 |
| `strip-leading-inverted-punct.js` | **C. 仍属于正式运维工具，应保留并补充文档** | 高 |

本轮调查发现一个第一阶段审计未完全展开的**关键连带事实**：`factoryPhotos` 并非孤立字段，而是 2026-07-29 18:21:58 的提交 `a6a2b95 feat(site): remove Factory and OEM-ODM pages/routes` 删除 `/factory`、`/es/factory`、`/oem-odm`、`/es/oem-odm` 四个页面文件后遗留的**连锁孤儿**——该提交只删除了页面文件和 `sitemap.ts` 里的 2 行，但没有同步清理：①两个页面消费的 `SiteSetting` 字段（`factoryPhotos` 及其"同族"字段 `stats`/`oemProcessSteps`/`factoryStats`/`partnerRegions`）；②对应的后台表单 UI；③`STRUCTURED_JSON_SLUGS` 常量；④数据库里仍然存在的 `factory`/`oem-odm` 两条 `Page` 记录；⑤数据库里仍然存在（但已被手动置为不可见）的两条导航菜单项。这是一次**半完成的清理**，而不是相互独立的三个问题。

---

## 二、factoryPhotos 调查结果

| 检查项 | 结果 | 证据位置 | 风险 | 结论 |
| --- | --- | --- | --- | --- |
| Prisma 定义位置与类型 | `backend/prisma/schema.prisma:530`，`factoryPhotos String @default("[]")`（JSON 字符串存储字符串数组） | schema.prisma | — | 自初始 commit 起即存在，非后续新增 |
| 引入时间 | `20260719041904_init`（初始迁移，2026-07-19），此后从未变更/改名 | migrations/20260719041904_init/migration.sql:265 | — | 无改名、无替代字段 |
| JSON 序列化逻辑 | `backend/src/modules/settings/settings.service.ts` 的 `JSON_FIELDS` 数组统一处理，`fromJsonString`/`toJsonString` | settings.service.ts:6-15 | 低 | 序列化机制正常、与其余 JSON 字段一致 |
| 后台编辑入口 | 「首页模块」（`/admin/homepage`），`HomepageForm.tsx` 的"工厂图片地址"文本域（JSON 数组格式） | `frontend/src/app/admin/(dashboard)/homepage/HomepageForm.tsx:86-88` | — | 管理员可自由填写图片 URL 列表 |
| 保存链路 | `HomepageForm` → `updateSettingsAction`（`frontend/src/lib/actions/admin/settings.ts:98,127`）→ `PATCH /settings`（后端）→ `settings.service.ts` 写入 `site_settings` 表 | 见上 | — | 保存链路完整，字段确实会被真实持久化 |
| 校验与权限 | 后端 `settings.schema.ts:56` 用 `z.array(z.unknown()).optional()` 做宽松校验；写入权限受「设置」资源的角色控制（与其余全站设置一致，未见单独加固/削弱） | settings.schema.ts | 低 | 无异常权限配置 |
| 前台英文消费 | **0 处**：`grep factoryPhotos` 于 `frontend/src/app/(site)` 与 `frontend/src/components` 均无命中 | 见审计命令记录 | — | 当前无前台渲染 |
| 前台西语消费 | **0 处**：`frontend/src/app/es` 同样无命中 | 同上 | — | 同上 |
| 历史消费者 | **曾经存在**：`frontend/src/app/(site)/factory/page.tsx`（已删除）第 60-72 行有 `settings.factoryPhotos.map(...)` 渲染"Production Facilities"图片墙 | `git show a6a2b95^:"frontend/src/app/(site)/factory/page.tsx"` | — | 证实字段曾被消费，非从未使用 |
| 删除该消费者的提交 | `a6a2b95083de886757ba75b3c7c22762597bf8c0`，2026-07-29 18:21:58 +0800，commit message：`feat(site): remove Factory and OEM-ODM pages/routes`，**仅删除 4 个 page.tsx 文件 + sitemap.ts 2 行，未触碰 SiteSetting 字段/表单/STRUCTURED_JSON_SLUGS** | `git show --stat a6a2b95` | — | 半完成清理的直接证据 |
| 是否存在"同族"孤儿字段 | **是**：`stats`、`oemProcessSteps`、`factoryStats`、`partnerRegions` 与 `factoryPhotos` 定义在 schema 同一区块（`schema.prisma:526-531`），后台表单同样可编辑，但**这 4 个字段自项目初始 commit 起就从未被任何前台页面消费过**（连被删除的 `/factory`、`/oem-odm` 页面本身也没有读取它们——那两个页面读取的是 `Page.sections`，走的是完全不同的 `STRUCTURED_JSON_SLUGS` 机制） | `git log --all -S` 定点核查 + 全仓库 grep | — | 范围比"单个字段"更大 |
| 是否存在已建好但从未接线的前端组件 | **是，且是本轮调查最重要的发现**：`frontend/src/components/home/` 下存在 5 个自初始 commit 起就完整存在、类型严丝合缝对应上述字段、但**从未被任何页面 import** 的组件：`FactoryStrength.tsx`（消费 `factoryStats`+`factoryPhotos`）、`OemProcess.tsx`（消费 `oemProcessSteps`）、`StatsCounter.tsx`（消费 `stats`）、`GlobalPartners.tsx`（消费 `partnerRegions`）、`CountUpValue.tsx`（仅被 `StatsCounter` 内部使用，随之一同孤立） | `grep FactoryStrength\|OemProcess\|StatsCounter\|GlobalPartners` 全仓库仅命中各自定义处；`git log -S FactoryStrength -- "frontend/src/app/(site)/page.tsx"` 无任何历史提交 | — | 说明"接入前台"的工程量远小于预期——组件本身已经现成可用 |
| 恢复展示的影响范围 | 若选择"接入前台"：只需在 `frontend/src/app/(site)/page.tsx`（以及可选的 `frontend/src/app/es/page.tsx`）中 import 并渲染这 4 个现成组件，传入 `settings.xxx`，**不需要改动数据库/后端/后台表单**，因为数据链路全程都是完整的，只是"最后一公里"渲染从未接上 | 见上 | 低（纯前端改动） | — |
| 是否涉及数据库迁移 | 两种处理方向均**不需要**新迁移：接入前台=只加前端渲染；删除字段=需要一次 `DROP COLUMN` 迁移（对 5 个字段） | — | 若选删除，中风险（结构性迁移，需确认无历史数据依赖） | — |
| 是否涉及英西语同步 | 是：`factoryPhotos`/`factoryStats` 等字段目前没有 locale 概念（`SiteSetting` 是单例表，非 `*Translation` 表），若接入前台，英文站和西语站会显示同一份图片/数据（这与首页其余模块如 Hero、核心优势的处理方式一致，核心优势本身也是通过独立的 `Translation` key 做的西语覆盖，需额外规划） | `schema.prisma` SiteSetting 定义 | — | 若接入前台需要额外规划 i18n 覆盖方式 |
| 删除风险 | 中：`factoryPhotos`（及同族 4 字段）目前没有别的消费者，删除字段本身对现有功能零影响；但需要一次结构性 migration（`DROP COLUMN` ×5），且需要用户确认数据库里目前是否已经录入了有意义的真实数据（本次未查询字段内容，仅确认了 Page/Nav/Translation 记录的存在性，未读取 SiteSetting 的 JSON 内容） | — | 中 | — |

**最终推荐**：**"暂不处理"为当前最安全选项**，但真实建议是**由业务方在"接入前台"与"后续删除"之间二选一**——因为"接入前台"的实现成本异常低（组件已经现成），"删除"需要走结构性迁移；不建议"后台隐藏"（半吊子方案，用户仍会看到无效表单）。

---

## 三、STRUCTURED_JSON_SLUGS 调查结果

### 1. 常量定义

| 项 | 内容 |
| --- | --- |
| 文件路径 | `frontend/src/lib/actions/admin/pages.ts:22`、`frontend/src/app/admin/(dashboard)/pages/PageForm.tsx:33` |
| 定义内容 | 两处均为 `const STRUCTURED_JSON_SLUGS = new Set(['factory', 'oem-odm'])`，两个文件的注释都明确写"两边必须保持一致" |
| 实际作用 | 控制后台「页面管理」编辑器的 `sections` 字段渲染形态：命中该 Set 的 slug 显示为 JSON 文本域（`pages.ts` 侧同时会对提交内容做 `JSON.parse` 校验），未命中的 slug（About/Contact/Privacy 等）该字段按纯 HTML/文本处理 |
| 触发结构化 JSON 编辑的 slug | 当前仅 `factory`、`oem-odm` 两个 |
| 数据落地位置 | `Page.sections`（`backend/prisma/schema.prisma:438`，`String?`，JSON 字符串） |

### 2. 前台路由

| 检查项 | 结果 |
| --- | --- |
| `/factory` | 不存在（`next build` 完整路由清单 69 条中无此项） |
| `/oem-odm` | 不存在 |
| `/es/factory` | 不存在 |
| `/es/oem-odm` | 不存在 |
| 重定向/rewrite | `next.config.ts` 未见 `redirects`/`rewrites` 配置指向这两个路径（本轮未逐字节复核 next.config，若需要 100% 确认建议单独核查一次） |
| 动态 `[slug]` 路由承接 | **不存在**：`(site)` 与 `es` 目录下均无通用 `[slug]/page.tsx` 之类的兜底动态路由，`Page` 模型的每个 slug 都对应一个具名静态路由文件（如 `about/page.tsx`），`factory`/`oem-odm` 对应的路由文件已被 `a6a2b95` 物理删除，没有任何兜底承接机制 |
| middleware 承接 | `frontend/src/proxy.ts`（本项目的 middleware）职责是后台登录态拦截，未见对 `/factory`/`/oem-odm` 的特殊处理 |
| sitemap 是否包含 | **不包含**：`a6a2b95` 已同步从 `frontend/src/app/sitemap.ts` 的 `staticPaths` 中删除了 `/oem-odm`、`/factory` 两行——这两处清理是同步的，没有遗漏 |
| 导航菜单是否链接 | **数据库中仍有 2 条记录**：`NavigationItem` 表中 `url=/oem-odm`（label: "OEM / ODM"）与 `url=/factory`（label: "Factory"）依然存在，但**均已被手动置为 `visible=false`**（本机开发库只读查询结果，生产库需另行核实）——即当前**不会**在导航栏展示为可点击死链，但记录本身未被清理 |
| 页面内链接 | 未见任何现存页面的正文/组件硬编码链接到 `/factory` 或 `/oem-odm`（`Header.tsx`/`Footer.tsx` 中命中的"factory"字符串经核实均为 `Water Purifier Factory` 公司名兜底文案，与路由无关） |
| canonical/hreflang | 无影响：两条路由已不存在，自然不会生成 canonical/hreflang（`a6a2b95` 删除页面文件时一并删除了各自的 `generateMetadata`，不会产生"僵尸 canonical"） |

**结论：不是仅凭"目录不存在"就下结论**——已额外核查动态路由、rewrite、sitemap、导航菜单、Page 数据表，确认前台入口是彻底、干净地不存在（除导航菜单里 2 条已隐藏但未删除的记录外，无任何遗留的可达路径）。

### 3. Page 表和后台管理链

| 检查项 | 结果 |
| --- | --- |
| Page 表是否仍允许创建/编辑 `factory` | 是，`pages.service.ts` 的 `findMany`/`findUnique` 无任何 slug 白名单限制，理论上后台可以创建/编辑任意 slug，包括 `factory`/`oem-odm` |
| 后台页面列表是否会出现 | **会**：`frontend/src/app/admin/(dashboard)/pages/page.tsx:13-14` 硬编码了中文友好标签 `factory: '工厂实力'`、`'oem-odm': 'OEM/ODM 服务'`，`pages.service.ts:15` 的 `findMany({ orderBy: { slug: 'asc' } })` 无过滤条件，会把这两条记录一并列出 |
| API 是否会返回 | 会：`GET /pages` 与 `GET /pages/:slug` 均无 slug 过滤/白名单逻辑 |
| 动态页面渲染器是否消费 | **否**：因为对应前台路由文件已删除，即便 API 返回数据也无处渲染（前台请求会得到 Next.js 全局 404，见 `frontend/src/app/not-found.tsx` 或 `globalNotFound` 实验特性） |
| 结构化 JSON 是否仍被前台组件使用 | 否（同上，无渲染者） |
| 数据库记录依赖（只读查询结果） | **`factory` slug：存在，1 条记录；`oem-odm` slug：存在，1 条记录**（本机开发库，`Page.findMany({ where: { slug: { in: ['factory','oem-odm'] } }, select: { slug: true } })`，未读取任何正文/SEO/JSON 内容） |
| 状态/发布逻辑 | `Page` 模型本身**没有草稿/发布状态字段**（不同于 Product/BlogPost 的 DRAFT/PUBLISHED），Page 记录只要存在即被后台/API 视为"有效"，没有单独的可见性开关 |

### 4. Git 历史

| 项 | 结果 |
| --- | --- |
| 路由删除提交 | `a6a2b95083de886757ba75b3c7c22762597bf8c0`，2026-07-29 18:21:58 +0800，作者 `鲤门科技 <adengcheng1@gmail.com>`，commit message：`feat(site): remove Factory and OEM-ODM pages/routes` |
| 删除时是否同步更新 STRUCTURED_JSON_SLUGS | **否**——`git show --stat a6a2b95` 显示该提交只改了 5 个文件（4 个 page.tsx + sitemap.ts），未涉及 `pages.ts`/`PageForm.tsx` |
| 是否存在半完成迁移 | **是**，如"执行摘要"所述，这是一次范围界定过窄的清理（只删前端路由文件，未清理关联的常量/数据/表单/导航记录） |
| 是否存在新页面替代旧页面 | 未发现证据表明 Factory/OEM-ODM 的内容被迁移合并进其他现存页面（如 About），删除提交本身没有在 commit message 或代码中说明替代方案 |
| 相关注释说明 | `pages.ts`/`PageForm.tsx` 中的注释仍然停留在"删除前"的认知（"只有 Factory / OEM-ODM 页面的结构化区块字段是真正的 JSON"），未随路由删除更新措辞 |

### 5. 最终分类

| slug | 当前前台入口 | 后台入口 | 数据库依赖 | SEO 依赖 | Git 历史证据 | 推荐 |
| --- | --- | --- | --- | --- | --- | --- |
| `factory` | 无（路由文件已删除，无兜底） | 有（后台「页面管理」仍可编辑，标签"工厂实力"） | Page 表 1 条记录仍存在；导航项 1 条（已隐藏） | 无（sitemap 已同步清理） | `a6a2b95` 删除路由，未清理常量/记录 | **B. 旧路由残留，可以从常量中移除**（前提：确认 Page 记录与隐藏导航项一并按用户决策处理） |
| `oem-odm` | 无（同上） | 有（同上，标签"OEM/ODM 服务"） | Page 表 1 条记录仍存在；导航项 1 条（已隐藏） | 无 | 同上 | **B. 旧路由残留，可以从常量中移除**（同上前提） |

---

## 四、一次性脚本调查结果

### 1. 脚本用途

| 脚本 | 用途 | 读取数据 | 修改表/字段 | 连接生产库 | dry-run | 幂等性 | 重复执行风险 | 硬编码路径 | 环境变量依赖 | 文档 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `seed-core-advantages-es.js` | 为首页"核心优势"3 张卡片（共 6 个字段：3×title+3×description）补西语译文 | 无读取，直接 `upsert` | `Translation` 表（`locale='es'`, `key` 前缀 `settings.coreAdvantages.*`） | 由运行时 `DATABASE_URL` 决定，脚本本身未硬编码库地址；若在生产容器内执行会写生产库 | **无** | 是（`upsert` by unique key，重复跑只会覆盖成同样的值，不会重复插入） | 低（幂等，但内容是硬编码占位译文"Marcador de posición..."，重复执行不会产生新风险，只会反复覆盖成同一份占位文案） | 否 | 依赖 `DATABASE_URL`（继承 Prisma 默认行为） | 无独立文档，仅脚本头部 1 行中文注释 |
| `strip-leading-inverted-punct.js` | 批量扫描所有 `locale='es'` 的翻译记录，去掉字段开头的 `¿`/`¡`（不动句中） | 读取多张 `*Translation` 表 + `Translation` 表 | 同上（仅去头逻辑，非破坏性字符串处理） | 同上，取决于运行环境 `DATABASE_URL` | **有**（脚本内建 `--dry-run`） | 是（`strip()` 对已经不带 `¿¡` 开头的字符串是恒等操作） | 极低（`--dry-run` 可先验证；即使误跑，最坏情况是把开头本该保留的 `¿`/`¡` 也去掉，但用户既有的产品规范是"西语文案开头不要¿/¡"，行为符合预期） | 否 | 同上 | 头部注释含用法示例，含 Docker 容器内执行方式 |

（本次审计**未执行**这两个脚本本身，也未执行其数据修改逻辑，以上"是否幂等/风险"评估均基于代码只读审查得出。）

### 2. 引用关系

| 检索位置 | `seed-core-advantages-es.js` | `strip-leading-inverted-punct.js` |
| --- | --- | --- |
| `package.json`（backend） | 未引用 | 未引用 |
| README.md / DEPLOYMENT_CHECKLIST.md | 未引用 | 未引用 |
| Dockerfile / docker-compose*.yml | 未引用 | 未引用 |
| 其他脚本 | 未引用 | 未引用 |
| GitHub Actions / CI | 项目无 CI 配置（未见 `.github/workflows`） | 同左 |
| `.claude/` 配置 | 未引用 | 未引用 |
| 代码注释（其他文件） | 未见其他文件提及 | 未见其他文件提及 |
| 用户持久化偏好记录 | 未提及 | **用户此前已明确记录该规则**（"西语文案开头不要¿/¡，有审计脚本可复用"），与本脚本功能完全对应，属于强烈的"应保留"信号 |

### 3. Git 历史

| 项 | `seed-core-advantages-es.js` | `strip-leading-inverted-punct.js` |
| --- | --- | --- |
| 创建 commit | `c5423db71aa6c6b9baf936f9b000116491d4baaf`，2026-07-29 03:40:56 +0800，`feat(i18n): translate homepage core advantages cards to Spanish` | `204cc7be82b7b7dd236491caf354e375be196ca4`，2026-07-29 03:24:40 +0800，`fix(i18n): drop leading inverted question marks from Spanish content` |
| 最近修改 | 无（仅 1 次提交，此后从未再改动） | 无（仅 1 次提交，此后从未再改动） |
| 是否已有后续代码正式接管 | 是——首页核心优势的西语展示现在由正式的 `FaqTranslation`/`Translation` 读取链路（`resolveFaqContent` 同款模式）承载，脚本只是当时补数据的一次性手段 | 否——目前**没有**任何正式代码路径在西语内容"保存"时自动拦截/清洗开头的 `¿¡`，也就是说如果后续管理员在后台编辑西语内容时手滑输入了开头 `¿¡`，不会被自动清理，仍需要靠这个脚本手动跑一遍 |
| 完成标记/TODO | 无独立 issue/TODO，纯粹通过脚本头部注释说明背景 | 同左 |
| 是否只是一次性生产数据修复 | **是**，且已通过本次只读查询确认目标数据（6 个 Translation key）已存在于库中，任务已达成 | **不是纯一次性**——只要后台还允许人工录入西语文本且没有输入侧校验，这个"问题"就有复发可能，脚本更像一个"按需重跑"的运维工具 |

### 4. 数据兼容风险与最终分类

| 脚本 | 删除是否影响生产运行/构建/部署/恢复 | 分类 | 证据 | 置信度 | 推荐处理 | 删除风险 | 是否需要文档归档 | 是否需要测试 | 是否需要单独 commit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `seed-core-advantages-es.js` | 均无影响：非 build 依赖、非部署依赖、非恢复流程依赖，仅是历史一次性数据修复的操作留痕 | **A. 已完成使命，可以删除** | 单一 commit、未被任何地方引用、目标数据（6 个 Translation key）已通过只读查询确认存在于库中、内容是硬编码的"当时"占位西语译文，不具备可复用的通用逻辑 | 高 | 确认后可通过 `git rm` 清理；如担心丢失历史背景，可在删除前把脚本头部注释摘要写入 `git rm` 的 commit message（Git 历史本身即为归档，无需专门文档） | 低 | 建议（保留在 commit message 里说明背景即可，不必新增文档文件） | 不需要（无自动化测试覆盖此类一次性脚本，属正常现状） | 是（应作为独立的"仓库整洁度"提交，不与业务改动混在一起） |
| `strip-leading-inverted-punct.js` | 均无影响 | **C. 仍属于正式运维工具，应保留并补充文档** | 用户既有的持久化偏好记录明确将此规则与"可复用审计脚本"挂钩；脚本本身幂等、支持 `--dry-run`、无副作用风险；对应的"防止复发"能力（后台录入校验）目前不存在，脚本是唯一的补救手段 | 高 | 建议：①补充进 `backend/package.json` 的 `scripts`（如 `check:es-punctuation`）；②在 README 或 `DEPLOYMENT_CHECKLIST.md` 补一行说明用途和运行方式；③（可选，超出本次清理范围）评估是否要在后台西语表单保存时加一层校验，从根源上避免复发 | 不适用（不建议删除） | **需要**（应该补充使用文档，这正是它当前缺失的部分） | 不需要新增自动化测试（脚本本身逻辑简单，`--dry-run` 已提供足够的人工验证手段） | 是（补充 `package.json` 脚本入口 + README 说明，作为一次独立的"工具规范化"提交） |

---

## 五、.claude 目录建议

| 内容类型 | 是否敏感 | 是否应提交 | 是否应忽略 | 依据 |
| --- | --- | --- | --- | --- |
| `.claude/launch.json`（357 字节，内容：`frontend`/`backend` 两个 dev server 的启动命令 `npm run dev`、工作目录、端口 3000/4000） | **否**——纯项目级开发服务器配置，不含任何路径、密钥、Token 或个人信息，两个 `runtimeExecutable`/`runtimeArgs`/`port` 字段全部是项目公开信息（`README.md` 第 4 节本身就写明了同样的端口和启动命令） | **建议提交**——这是纯项目配置（哪个目录跑哪个 `npm run dev`、监听哪个端口），任何在本仓库工作的开发者/AI 会话都需要它，纳入版本控制可以避免每个人/每次会话都要重新创建一遍 | 否 | 内容 100% 可公开，且是"项目共享规则"性质，不是"本地个人配置" |
| `.claude/worktrees/`（空目录） | 不适用 | 不适用（空目录 Git 不track） | 可选：若希望避免该路径将来被意外写入后又忘记清理，可以在 `.gitignore` 里加一行 `/.claude/worktrees/`（预防性，非必须，因为目前是空的） | Git 空目录本身不会被提交，无需额外动作；仅作为"卫生建议"提出 |

**最终分类：建议部分提交**——`launch.json` 建议提交，`worktrees/` 无需处理（可选加入 `.gitignore` 作为预防）。

（说明：本次未在 `.claude/` 目录下发现任何 `settings.json`、hooks 配置、MCP 凭据文件或其他可能包含个人信息/密钥的内容；目录结构本身非常简单，仅 1 个配置文件 + 1 个空目录。）

---

## 六、建议整改批次

> 以下均为建议，本次审计未执行任何一项。

### 批次 A：无行为变化的历史脚本清理

- **修改文件**：`git rm backend/scripts/seed-core-advantages-es.js`
- **不修改内容**：不涉及 `strip-leading-inverted-punct.js`（该脚本走批次 D，性质不同）、不涉及任何业务代码、数据库、Prisma schema
- **验证方法**：删除后重新执行前后端 `lint`/`build`/`test`（预期与本报告基线一致，因为该脚本本就是零引用的孤立文件），并人工确认后台「首页模块」的西语核心优势文案仍正常显示（数据在 `Translation` 表，与脚本文件本身无关，删除脚本不影响已落地的数据）
- **风险**：低
- **回滚方式**：`git revert` 该提交，或从 Git 历史直接 `git show <commit>:backend/scripts/seed-core-advantages-es.js` 恢复文件内容
- **是否需要部署**：否（不影响运行时行为）
- **是否需要数据库备份**：否（不触碰数据库）

### 批次 B：失效 slug 常量与遗留 Page/导航记录同步清理

- **修改文件**：`frontend/src/lib/actions/admin/pages.ts`（移除或调整 `STRUCTURED_JSON_SLUGS`）、`frontend/src/app/admin/(dashboard)/pages/PageForm.tsx`（同上）、`frontend/src/app/admin/(dashboard)/pages/page.tsx`（移除 `factory`/`oem-odm` 标签映射）；如业务方确认彻底放弃这两个页面，还需要**人工在后台**删除 `factory`/`oem-odm` 两条 Page 记录、删除（而非仅隐藏）两条对应的导航菜单项
- **不修改内容**：不涉及其他 Page 记录、不涉及其他导航项、不涉及 SiteSetting 字段（那是批次 C 的范围）
- **验证方法**：清理后在后台「页面管理」确认列表不再出现"工厂实力"/"OEM/ODM 服务"；重新执行 `lint`/`build`；用真实浏览器确认后台"页面管理"新建页面时 `sections` 字段的 JSON/HTML 切换逻辑对其余页面（About 等）行为不变
- **风险**：低-中（涉及后台数据删除操作，删除 Page 记录前建议先做一次数据库快照/`scripts/backup.sh`）
- **回滚方式**：代码层面 `git revert`；数据层面若删除了 Page 记录，需要从备份恢复（因此强烈建议先备份再删除数据）
- **是否需要部署**：是（代码改动需要走正常的构建部署流程）
- **是否需要数据库备份**：**是**（如果决定连同 Page 记录一起删除）

### 批次 C：factoryPhotos 及同族字段的产品决策

- **修改文件**：取决于业务方决策——
  - 若选择"接入前台"：新增 `frontend/src/app/(site)/page.tsx`（及可选 `es/page.tsx`）对 `FactoryStrength`/`OemProcess`/`StatsCounter`/`GlobalPartners` 四个现成组件的 import 和渲染，**不涉及数据库/后端**
  - 若选择"删除"：需要一次 Prisma migration（`DROP COLUMN` × 5：`stats`/`oemProcessSteps`/`factoryStats`/`factoryPhotos`/`partnerRegions`）+ 同步移除后台表单对应字段
- **不修改内容**：`coreAdvantages` 字段及其渲染（`CoreAdvantages` 组件），因为它是当前唯一被正常使用的同族字段，不在本批次范围
- **验证方法**：若接入前台——真实浏览器验证首页新增区块的展示效果、中英西内容是否需要额外 i18n 覆盖；若删除——`prisma migrate dev` 后确认 `npm test`/`npm run build` 通过，且后台首页模块表单不再显示已删除字段
- **风险**：接入前台=低（纯新增，不影响现有功能）；删除=中（结构性迁移，需先确认生产库中这些字段当前是否已经被录入了业务方认为有价值的真实数据——本次审计未读取字段内容，无法替业务方做这个判断）
- **回滚方式**：接入前台方向可 `git revert`；删除方向需要 migration 回滚 + 数据备份恢复
- **是否需要部署**：是
- **是否需要数据库备份**：仅"删除"方向需要；"接入前台"方向不需要

### 批次 D：.claude 仓库策略

- **修改文件**：`git add .claude/launch.json` 并提交；可选：`.gitignore` 追加 `/.claude/worktrees/`
- **不修改内容**：不涉及任何业务代码
- **验证方法**：提交后确认新的开发者/会话打开 Browser 预览工具时能自动读取到该配置（无需手动重建 `launch.json`）
- **风险**：极低（纯配置文件，内容已核实不含敏感信息）
- **回滚方式**：`git revert`
- **是否需要部署**：否
- **是否需要数据库备份**：否

---

## 七、最终建议

1. **哪些内容现在可以安全处理**：批次 A（删除 `seed-core-advantages-es.js`）与批次 D（提交 `.claude/launch.json`）风险最低、影响面最小，且证据链完整，可以视为"工程侧可自行决定"的范畴。
2. **哪些内容需要业务决定**：批次 C（`factoryPhotos` 同族字段是"接入前台"还是"删除"）是纯粹的产品/业务决策，本报告只能提供事实和技术选项，不能替业务方决定；批次 B 中"是否彻底放弃 Factory/OEM-ODM 这两个页面概念"同样需要业务确认（有可能业务方将来还想重新上线这两个页面，此时保留 Page 记录反而是有价值的历史草稿）。
3. **哪些内容应保持不动**：`strip-leading-inverted-punct.js`（批次 D 外，不建议删除，建议保留并补文档）；`coreAdvantages` 字段及其渲染链路（唯一正常在用的同族字段，不在本次任何清理范围内）；已发布的产品/文章/证书等核心业务数据。
4. **是否值得执行代码瘦身**：值得，但**优先级不高、风险很低**——本次确认的三个问题均不是功能性缺陷（当前网站运行完全正常，导航死链已被提前手动隐藏），属于"仓库整洁度"与"半完成清理的收尾"性质，可以在不影响正常运营节奏的情况下按批次逐步处理。
5. **推荐首先执行的整改批次**：**批次 A**（删除 `seed-core-advantages-es.js`）——证据最充分、风险最低、不涉及任何数据库/部署操作，是四个批次里唯一可以"零决策成本"直接执行的一项；其次可以考虑批次 D（提交 `launch.json`），同样低风险。批次 B、C 建议在获得业务方对"Factory/OEM-ODM 页面是否永久放弃"和"工厂展示/OEM流程/数据统计/合作伙伴这几个首页板块是否要正式上线"两个问题的明确答复后再启动。

---

## 审计后自检（只读命令）

```
git status --short:
?? .claude/
?? CODE_HEALTH_AUDIT.md
?? CODE_HEALTH_CONFIRMATION.md

git diff --stat:
（空，无任何已跟踪文件被修改）

git diff -- CODE_HEALTH_CONFIRMATION.md:
（新文件，无基线可比对；本文件为本次确认任务唯一新增内容）
```

确认：除 `CODE_HEALTH_CONFIRMATION.md` 本身外，未修改任何已跟踪文件；未执行 `seed-core-advantages-es.js`/`strip-leading-inverted-punct.js`；本次对本机开发数据库执行的全部查询均为 `SELECT`/`findMany` 级别只读操作，未写入、未修改任何数据库记录；未修改源码、`package.json`、锁文件；未 commit；未 push；未重启或重新部署任何服务。
