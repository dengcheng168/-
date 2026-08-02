# KoiGate Tech 最终代码无效项清理 — 2026-08-02

## 1. 当前基线

- 分支：`chore/final-code-cleanup-2026-08-02`（从 `main` 切出）
- 执行前 HEAD：`1a67421d30dbfa8a89c702d27528b1831e3aed7d`（与当时的生产部署基线一致）
- 执行前工作区状态：干净（`git status --short` 无输出）
- 正式网站功能基线：见本次任务书第四节列出的前台 12 项、后台 15 项功能，均以 `https://koigatetech.com/` 当前实际行为为准

## 2. 已删除内容

本轮**没有删除任何文件**。经过对任务书列出的全部清理对象逐项排查后发现，绝大多数目标（`factoryPhotos` 字段、`FactoryStrength`/`OemProcess`/`StatsCounter`/`CountUpValue`/`GlobalPartners` 五个组件、其专属类型/样式/图片、失效的 i18n key）已经在此前会话的提交 `50a5d9e`（"chore: remove 5 unused homepage JSON fields and their orphaned components"）中被彻底删除，当前工作区里已经不存在这些文件和字段，不存在"可以再删一次"的对象。

| 文件 | 类型 | 删除依据 | 引用检查 | 风险 |
|---|---|---|---|---|
| （无） | — | — | — | — |

## 3. 已修改内容

| 文件 | 修改内容 | 原因 | 行为影响 |
|---|---|---|---|
| `backend/prisma/seed.ts` | 删除 `navItems` 数组中指向 `/oem-odm`、`/factory` 的两条导航条目；删除 `pages` 数组中 `slug: 'factory'`、`slug: 'oem-odm'` 两个页面文案对象（含其 `sections` 占位 JSON） | 这两个路由已在生产环境退役（访问返回 404），但一次性初始化脚本 `seed.ts` 仍在生成指向它们的 `NavigationItem` 和 `Page` 记录——如果未来在全新环境重新执行 `npm run seed`，会重新制造出"点了就 404 的导航链接"和"编辑了也没有页面能显示"的孤儿后台 Page 记录，属于典型的"容易误导管理员的孤儿后台入口"残留 | 仅影响*未来*全新环境执行 `seed` 时生成的初始数据；**不影响、不触碰生产数据库**（本轮全程未连接、未执行 seed）；不影响当前任何运行中的页面/接口行为 |
| `backend/prisma/seed-translations.ts` | 删除 `pageTranslations` 映射表中 `factory:` 和 `'oem-odm':` 两个西语翻译对象 | 与上一条同源：`seedPages()` 函数按 `prisma.page.findMany()` 实际存在的 slug 查找对应翻译，`seed.ts` 不再生成 `factory`/`oem-odm` 这两个 Page 之后，这两条译文本身就成为死数据，一并清理保持两个种子脚本一致 | 同上，仅影响未来全新环境的种子数据；不影响生产 |

两处改动均为**脚本源码编辑**，不是脚本执行——本轮全程未运行 `npm run seed` / `seed:translations`，未连接生产数据库，`backend/prisma/seed.ts` 中其余页面（about/privacy-policy/terms-of-use/contact/certificates/blog/products）、`toJsonString` 辅助函数等均未改动。

## 4. 暂时保留内容

| 文件或字段 | 保留原因 | 后续处理条件 |
|---|---|---|
| `backend/prisma/migrate-faq-translations.ts` | 一次性但设计为幂等（`faqId+locale` 唯一约束、已存在记录一律跳过不覆盖），被 `backend/package.json` 的 `migrate:faq-translations` script 引用，保留作为西语 FAQ 翻译数据的灾难恢复/重跑工具 | 若确认西语 FAQ 翻译体系已彻底稳定且从未需要重跑，可在未来单独评估删除 |
| `backend/prisma/backfill-site-base-url.ts` | 同上，幂等、有 package.json script 引用、有配套单元测试 `backend/test/backfill-site-base-url-decision.test.ts`，用于环境变量→数据库域名的迁移期兼容回填 | 若确认所有环境的 `SiteSetting.siteBaseUrl` 已长期稳定填充，可评估删除 |
| `backend/scripts/strip-leading-inverted-punct.js` | 任务书第八节明确要求"除非有新证据证明它已完全失效，否则保留，不得删除"；本轮未发现任何新证据表明其已失效 | 不适用（按任务书要求保留） |
| `scripts/backup.sh`、`scripts/restore.sh`、`scripts/deploy.sh`、`scripts/update.sh`、`backend/scripts/create-admin.ts` | 正式运维脚本，被 README/DEPLOYMENT_CHECKLIST/Dockerfile/package.json 多处引用，非清理对象 | 不适用 |
| 前后端 `package.json` 中约 34 个未被本轮抽查覆盖到的依赖包 | 本轮仅人工抽查了 22 个（前后端各约 11 个）看起来生僻的包名，均找到实际引用，未发现无引用依赖；但抽查覆盖面不到全部依赖的一半，证据不足以对未抽查部分下结论 | 需要人工确认：建议后续使用 `depcheck`/`knip` 等工具做一次详尽扫描后再决定是否有依赖可删 |
| `frontend/src/lib/seo/jsonld.test.ts` 的 TypeScript 类型错误（`companyMapImage` 缺失） | 本轮验证时发现，但已用 `git stash` 确认该错误在执行前 HEAD（`1a67421`）就已存在，与本轮任何改动无关，且不属于任务书定义的"无效代码/旧功能残留"清理范畴（是测试 fixture 类型过期的独立 bug） | 需要人工确认：建议作为独立的小修复任务处理（给该测试 fixture 补上 `companyMapImage` 字段），不在本次清理范围内 |

## 5. factoryPhotos 处理结果

- 后台入口是否移除：**不适用**——该字段及其后台表单入口已在此前提交 `50a5d9e` 中随 `HomepageForm` 一并整体删除，当前代码库中已不存在
- Prisma 字段是否保留：**否**，字段本身已随迁移 `20260802002000_remove_unused_homepage_json_fields` 从 `SiteSetting` 表结构中一并移除（非本轮操作，为既有事实）
- 历史值是否保留：不适用（字段已不存在，不存在"历史值"这个概念）
- 保存其他设置是否会覆盖历史值：不适用；当前 `settings.service.ts` 的 `JSON_FIELDS` 常量已不包含 `factoryPhotos`，`patchSettings` 对未传字段的处理逻辑（`if (value===undefined) continue`）是安全的"仅显式传入才更新"写法，与 `factoryPhotos` 无关

**结论：任务书假设的"字段仍存在、需要退役后台入口但保留字段和数据"这一前提，与当前代码库实际状态不符——该字段已经完整删除（代码+DB 列），本轮无需也无法对其做进一步处理。**

## 6. 未接线组件处理结果

以下 5 个组件文件在当前工作区中**均不存在**（已在此前提交 `50a5d9e` 中删除），本轮无操作：

| 组件 | 当前状态 | 分类 |
|---|---|---|
| FactoryStrength | 文件不存在 | 已删除（非本轮） |
| OemProcess | 文件不存在 | 已删除（非本轮） |
| StatsCounter | 文件不存在 | 已删除（非本轮） |
| CountUpValue | 文件不存在 | 已删除（非本轮，为 StatsCounter 唯一消费者，随其一并删除） |
| GlobalPartners | 文件不存在 | 已删除（非本轮） |

附注：发现仓库外存在一个独立的旧 git worktree 目录 `D:\净水器网站\idle-logout-browser-test`，其中仍保留这 5 个文件及一个 `/es/oem-odm/page.tsx` 的历史副本。该目录不属于本次审计范围（`D:\净水器网站\site`），是另一个独立工作树，不影响当前生产站点，本轮未触碰。

## 7. 脚本处理结果

- 一次性脚本候选：**0 个**（`backend/scripts/seed-core-advantages-es.js` 此前审计中记录为一次性脚本候选，现已确认在仓库中不存在，早于本轮被清理）
- 本轮删除的脚本：**0 个**
- 保留的运维脚本：`scripts/backup.sh`、`scripts/restore.sh`、`scripts/deploy.sh`、`scripts/update.sh`、`backend/scripts/create-admin.ts`（正式运维）；`backend/scripts/strip-leading-inverted-punct.js`（按要求强制保留）；`backend/prisma/migrate-faq-translations.ts`、`backend/prisma/backfill-site-base-url.ts`（幂等可重跑工具，见第四节）

## 8. 依赖处理结果

- 本轮删除的依赖：**0 个**
- 抽查 22 个包（前后端各约 11 个），全部找到实际引用，无删除依据
- 未做全量依赖扫描（任务书禁止执行自动依赖清理工具），未抽查部分标记为"需要人工确认"，见第四节

## 9. 测试结果

| 项目 | 结果 |
|---|---|
| backend lint | 通过，0 警告/错误 |
| frontend lint | 通过，0 警告/错误 |
| backend `tsc --noEmit` | 通过 |
| frontend `tsc --noEmit` | **1 个预存在错误**（`jsonld.test.ts:55` 缺少 `companyMapImage` 字段），已用 `git stash` 验证执行前 HEAD 即存在，与本轮改动无关 |
| backend `npm test` | 127/127 通过 |
| frontend `npm test` | 96/96 通过 |
| backend `npm run build` | 通过 |
| frontend `npm run build` | 通过；路由清单确认无 `/factory`、`/oem-odm`、`/es/factory`、`/es/oem-odm`，混淆后台登录路径正常存在 |

## 10. 最终结论

- **是否删除了无效代码**：否，本轮排查后确认此前会话已完成绝大部分清理，当前无剩余"证据充分可删除"的死代码/孤儿组件/字段
- **是否改变正式网站行为**：否，唯一改动是两个一次性种子脚本的源码（不参与运行时渲染，未执行），不影响任何正在运行的页面/接口/后台行为
- **是否需要数据库 migration**：否
- **是否存在仍需人工确认的候选**：是，2 项——（1）未抽查到的约 34 个依赖包，建议用 depcheck/knip 做详尽扫描；（2）`jsonld.test.ts` 的预存在类型错误，建议作为独立小修复处理
- **是否适合部署**：本轮改动风险极低（仅种子脚本源码，未执行、未触碰生产数据），但按任务书要求本轮**不部署**，是否部署由业务方另行决定
