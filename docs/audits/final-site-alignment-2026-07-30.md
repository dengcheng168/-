# 以正式线上版本为基线的代码整改方向确认报告

- 报告日期：2026-07-30
- 产品基线：`https://koigatetech.com/`（正式线上版本，已确认为最终产品版本）
- 审计性质：**只读**。本次仅通过浏览器访问正式线上网站（真实 HTTP 请求，非本机开发环境）与只读代码检查（`grep`/`git log`/`git show`）完成核查，**未修改任何文件、未提交、未部署、未修改数据库**。
- 仓库基线：分支 `main`，HEAD `1b1aa3dd8eaa3f00e133df8b6e2b3168d45cb970`（上一轮批次 A 三个提交之后的状态，本次未新增任何代码改动）。

---

## 1. 首页三个 Placeholder 的准确数据来源

**线上实况**（2026-07-30 通过浏览器直接访问 `https://koigatetech.com/` 确认）：首页 "Core Advantages" 区块三张卡片，英文站原文一字不差为：

- OEM/ODM Expertise — "Placeholder — years of OEM/ODM manufacturing experience"
- Quality Control — "Placeholder — multi-stage quality inspection process"
- Global Shipping — "Placeholder — reliable export logistics worldwide"

**数据来源**：`SiteSetting.coreAdvantages` 字段（`backend/prisma/schema.prisma:526`，JSON 字符串），渲染链路 `frontend/src/app/(site)/page.tsx:47` → `<CoreAdvantages items={settings.coreAdvantages} />`（`frontend/src/components/home/CoreAdvantages.tsx`）。

**逐字比对确认非巧合**：`backend/prisma/seed.ts:319-323` 的种子数据：
```
coreAdvantages: toJsonString([
  { title: 'OEM/ODM Expertise', description: 'Placeholder — years of OEM/ODM manufacturing experience.' },
  { title: 'Quality Control', description: 'Placeholder — multi-stage quality inspection process.' },
  { title: 'Global Shipping', description: 'Placeholder — reliable export logistics worldwide.' },
]),
```
与线上文案**逐字符一致**（仅末尾句号在页面渲染时被截断显示，属正常样式差异）。这证明：线上数据库里 `SiteSetting` 单例行（`id=1`）自项目首次创建以来，`coreAdvantages` 字段**从未被后台保存操作覆盖过**——种子脚本使用 `prisma.siteSetting.upsert({ where: { id: 1 }, update: {}, create: {...} })`，`update: {}` 意味着只要该行已存在，重复运行种子脚本也不会覆盖它；线上显示的正是最初创建时写入的占位值。

**不是前端 fallback**：`frontend/src/lib/api/settings.ts` 里的 `FALLBACK_SETTINGS.coreAdvantages` 是**空数组 `[]`**（仅在构建期后端不可达时使用），而 `CoreAdvantages` 组件在 `items.length === 0` 时直接返回 `null`（不渲染任何内容，不会显示"Placeholder"字样）。因此线上出现的"Placeholder"文字**只能来自数据库真实存储的内容**，不是前端兜底逻辑的产物。

---

## 2. 英语和西班牙语是否都有相同问题

**是，且成因略有不同，需要分别处理**：

- **英文站**：直接显示 `SiteSetting.coreAdvantages` 原始值（如上）。
- **西班牙语站**（`https://koigatetech.com/es`，已实测确认）：三张卡片显示为 "Marcador de posición — años de experiencia en fabricación OEM/ODM." 等——是英文 Placeholder 文案的**西班牙语翻译**，而不是空白或英文回退。

**西语覆盖机制**：`frontend/src/app/es/page.tsx:64` 调用 `localizeCoreAdvantages(settings.coreAdvantages, translations)`（`frontend/src/lib/i18n/content-overlay.ts:27-35`），按索引读取 `Translation` 表中 `locale='es'`、key 为 `settings.coreAdvantages.{i}.title` / `settings.coreAdvantages.{i}.description` 的记录，叠加在英文数组上；**没有对应译文的字段会自动回退显示英文原文**（不会出现空白）。

已在本机开发数据库确认（第二阶段审计报告 `CODE_HEALTH_CONFIRMATION.md`）：这 6 条 `Translation` 记录确实存在，且内容正是"Placeholder"的西语直译——由已删除的一次性脚本 `backend/scripts/seed-core-advantages-es.js`（2026-07-29 提交，已在批次 A 中移除脚本文件本身，但其**写入数据库的内容未受影响**）写入。**这意味着即使只修复英文 `SiteSetting.coreAdvantages` 字段，西语站也不会自动同步**——因为西语覆盖记录独立存在，会继续显示旧的西语占位翻译，除非同时更新或清除对应的 `Translation` 记录。

---

## 3. 修复 Placeholder 是否只需要后台内容更新

**是，纯内容问题，不需要修改任何前端架构或代码**，但需要两步、两个后台入口配合才能英西语同时修复：

| 步骤 | 后台入口 | 修改内容 | 是否已存在可用入口 |
| --- | --- | --- | --- |
| 1. 修复英文base | `/admin/homepage`（`HomepageForm.tsx` 的"核心优势"字段，`coreAdvantagesJson`） | 用真实文案替换 `SiteSetting.coreAdvantages` 里的 3 段 `title`/`description` | 是，功能完整可用 |
| 2. 同步西语覆盖 | `/admin/settings/i18n`（`TranslationsForm.tsx`，通过 `name="t__settings.coreAdvantages.{i}.title"` 等字段编辑） | 为每张卡片重新填写对应的西语翻译，或清空使其回退显示新的英文文案 | 是，功能完整可用 |

**保存后的缓存刷新**：`updateHomepageSettingsAction`（`frontend/src/lib/actions/admin/settings.ts:89-130`）保存后会调用 `revalidatePath('/admin/homepage')` 与 `revalidatePath('/', 'layout')`——**布局级重新验证会级联刷新首页及其子路由（包括 `/es`）**，无需额外的手动清缓存操作，机制本身没有问题。

**结论**：这是纯粹的"内容从未填写"问题，不是数据库缺失字段、不是前端默认值写错、不是缓存失效逻辑有 bug。**不需要改动任何前端架构代码**，通过现有两个后台页面即可完整修复。

---

## 4. `factory` 和 `oem-odm` 从代码中移除涉及哪些文件

只读全仓库检索确认，与这两个 slug 的"结构化 JSON 编辑器"判定逻辑相关的代码，**仅存在于以下 3 个文件**：

| 文件 | 具体内容 |
| --- | --- |
| `frontend/src/lib/actions/admin/pages.ts` | 第 17-22 行注释 + `const STRUCTURED_JSON_SLUGS = new Set(['factory', 'oem-odm'])`；第 24-32 行 `parseSections()` 函数依据该常量判断 `sectionsJson` 按 JSON 解析还是原样透传为 HTML 字符串 |
| `frontend/src/app/admin/(dashboard)/pages/PageForm.tsx` | 第 32-33 行同名常量定义；第 50-56 行 `isStructuredJson` 判定，控制"结构化区块"表单字段渲染为 JSON 文本域还是普通文本域（含英文表单与西语翻译表单两处） |
| `frontend/src/app/admin/(dashboard)/pages/page.tsx` | 第 11-21 行 `PAGE_LABELS` 映射表（覆盖全部 9 个 Page slug 的中文友好标签，其中 `factory: '工厂实力'`、`'oem-odm': 'OEM/ODM 服务'` 两条与本次相关，其余 7 条`about`/`privacy-policy`/`terms-of-use`/`contact`/`certificates`/`blog`/`products`需要保留不动） |

**未发现的相关内容**（逐项核查结果）：
- 独立的类型定义文件：不存在。已删除的 `frontend/src/app/(site)/factory/page.tsx`（历史提交中曾定义 `interface FactorySections`）、`oem-odm/page.tsx`（曾定义 `interface OemSections`）已随路由一并被 `a6a2b95` 提交删除，**当前代码库中不存在**这两个类型定义，无需额外清理。
- 后端条件判断：后端 `backend/src/modules/pages/pages.service.ts` 对 `slug` 无任何白名单/特殊分支逻辑（`findMany`/`findUnique` 一视同仁），**无需修改后端代码**。
- 测试引用：`backend/test/` 与 `frontend/src/**/*.test.{ts,tsx}` 全部检索均无命中 `factory`/`oem-odm`/`STRUCTURED_JSON_SLUGS` 相关内容，**无需修改任何测试文件**。

**移除方式**（只是记录范围，本次不执行）：把 `STRUCTURED_JSON_SLUGS` 收窄为空 Set 或直接移除该判定分支（`pages.ts`/`PageForm.tsx` 会退化为"所有 slug 一律按纯文本/HTML 处理"，与其余 7 个 Page 完全一致）；`page.tsx` 的 `PAGE_LABELS` 只需删掉 `factory`/`oem-odm` 两行，表格会自动回退显示 Page 记录自身的 `title` 字段（`Factory Strength`/`OEM / ODM Services`，均为无害的英文原标题，不影响使用）。

---

## 5. 移除旧 slug 是否会影响 About Us

**不会**。核查依据：

- `About Us` 页面对应的 Page slug 是 `about`，从未在 `STRUCTURED_JSON_SLUGS` 中出现过（该 Set 只包含 `'factory'`、`'oem-odm'` 两项，`about` 一直按照"非结构化 HTML"分支处理，`isStructuredJson` 对 `about` 恒为 `false`）。
- `frontend/src/app/(site)/about/page.tsx` 的渲染逻辑（`heroImage`/`bodyHtml`/`sections`）不引用 `STRUCTURED_JSON_SLUGS`、不引用 `pages.ts` 里的 `parseSections()` 判断结果的"JSON 解析"分支（`about` 的 `sections` 一直是原样字符串透传）。
- 移除 `factory`/`oem-odm` 两个 slug 只会影响这两个 slug 自身在后台编辑器里的表单形态，**不影响 Set 中不包含的任何其他 slug 的行为**，包括 `about`。

---

## 6. 当前 About Us 图片的准确数据来源

**线上实况**（2026-07-30 实测 `https://koigatetech.com/about` 与 `https://koigatetech.com/es/about`）：页面包含一个标题为 "Factory Testing & Customer Visits" / "Pruebas de fábrica y visitas de clientes" 的 16 张图组图集，每张配有编号（01-16）、标题（如 "Temperature Testing Chamber" "Salt Spray Test" "International Customer Visit" 等）与说明文字，英西语版本使用**相同的图片文件**（`/uploads/webp/...` 路径），仅文字说明分别翻译。

**代码层面确认数据来源**：
- `frontend/src/app/(site)/about/page.tsx` 只有三个可能的内容来源：①`page.heroImage`/`heroImageMobile`（单张顶部背景图，走 `PageHeroBanner`）；②`page.bodyHtml`（富文本正文，`dangerouslySetInnerHTML`）；③`page.sections`（**因 `about` 不在 `STRUCTURED_JSON_SLUGS` 里，按原始字符串处理**，同样通过 `dangerouslySetInnerHTML` 整段注入）。
- 全仓库 `grep` "Factory Testing"/"Temperature Testing Chamber"/"Salt Spray"/"FACTORY CAPABILITY" 等线上可见的英文原文字符串，**代码库中零命中**——证明这 16 张图集不是任何前端组件、不是任何硬编码数组，而是**管理员通过后台「页面文案」编辑器手写进 `Page.bodyHtml` 或 `Page.sections` 字段的一段自定义 HTML**（包含 `<img>` 标签 + 编号 + 标题 + 说明文字的完整排版），图片本身是通过媒体库真实上传（`/uploads/webp/` 路径证实经过后端 sharp 处理生成 WebP，非静态资源目录里的占位图）。
- 西语版本的对应内容存放在 `PageTranslation`（`pageId` 对应 `about`，`locale='es'`）的 `bodyHtml`/`sections` 字段里，是管理员**单独用西语重新编写/翻译的整段 HTML**（i18n 规范里"整段 JSON/HTML 覆盖"模式，非逐字段翻译）。

**结论**：About Us 的图片墙是一套已经真实运行、内容详实、英西双语均已就绪的成熟内容——完全独立于 `factoryPhotos`、独立于 `components/home/FactoryStrength.tsx` 等未接线组件，是管理员手工维护的 HTML 内容，不是任何结构化数据字段驱动的。

---

## 7. `factoryPhotos` 是否适合接入 About Us

**评估结论：不适合，倾向于"方案 B：退役"，但需业务侧最终确认。**

逐条对照用户提出的"方案 A：接入 About Us"四个必要条件：

| 条件 | 评估结果 |
| --- | --- |
| 后台确实需要经常更新工厂照片 | **现状已经能做到**——About Us 页面的图集是通过管理员编辑 `Page.bodyHtml`/`sections` 的富文本 HTML 实现的，理论上可以随时增删图片，只是操作方式是"编辑 HTML"而非"填一个图片 URL 列表" |
| 当前 About Us 图片没有更合适的数据管理方式 | **不成立**——当前方式虽然是手写 HTML，但已经支持"编号 + 标题 + 独立说明文字"的丰富排版（16 张图，每张都有独立标题和说明），这是 `factoryPhotos` 的**扁平字符串数组格式**（仅 `string[]`，无标题、无说明字段）完全无法承载的信息量。如果接入 `factoryPhotos`，要么损失现有的标题/说明文字，要么需要重新设计数据结构（这已经超出"接入"范畴，等同于重新开发） |
| `factoryPhotos` 的格式能满足当前页面 | **不满足**——现状是"16 张图 + 16 个标题 + 16 段说明"，`factoryPhotos: string[]` 只是纯 URL 数组，字段格式与当前页面实际需要的信息完全不匹配 |
| 接入不需要 Prisma migration | 满足（字段已存在，接入渲染不需要 migration），但这一条单独成立不足以支撑接入 |

**结论**：由于 About Us 现有的图片内容管理方式（手写 HTML）在丰富度上已经**超过** `factoryPhotos` 字段能提供的能力，"接入 About Us" 不会带来实际收益，反而可能造成"两套图片管理入口并存、内容重复或冲突"的新困惑。**倾向方案 B（退役）**，具体分阶段建议见"10. 推荐的四个整改批次"。

（英西语共用照片这一点确认可行——About Us 现有图集已经证明了"英西语共用同一批 `/uploads/` 图片、仅文字分别翻译"这一模式在本项目里是成立且已在运行的。）

---

## 8. 四个未接线组件是否与当前最终网站重复

| 组件 | 是否与线上最终版重复 | 说明 |
| --- | --- | --- |
| `FactoryStrength.tsx`（消费 `factoryStats`+`factoryPhotos`，渲染"Factory Strength"标题 + 数据统计卡 + 图片墙） | **是，功能上与 About Us 现有的 "Factory Testing & Customer Visits" 图集高度重复**，且信息量更贫瘠（无编号、无独立说明文字，仅统计数字 + 纯图片网格） | 概念重复，不建议再启用 |
| `OemProcess.tsx`（消费 `oemProcessSteps`，渲染编号步骤列表 "Our Service Process"） | 与当前网站**没有直接重复的板块**，但其消费的 `SiteSetting.oemProcessSteps` 数据（"Requirement Discussion"→"Solution Design"→...→"Global Delivery" 6 步）是种子占位内容，未见业务侧确认过是否为真实流程 | 无直接重复，但数据未经确认，且组件文案 `eyebrow="OEM / ODM"`/`title="Our Service Process"` 是硬编码英文（未接入 `t()` 国际化字典，即使启用也无法自动适配西语） |
| `StatsCounter.tsx`（消费顶层 `stats`，渲染数字滚动动画统计条） | 与当前网站**没有重复板块**，首页目前没有类似的"数字统计条" | 无重复，但同样依赖种子占位数字（"10+ Years"/"30+ Countries"/"1,000,000+ Units"），未经业务确认真实性 |
| `GlobalPartners.tsx`（消费 `partnerRegions`，渲染地区标签云 "Partnership Regions"） | 与当前网站**没有重复板块** | 无重复，数据（"North America"/"Europe"/"Middle East"/"Southeast Asia"）同样是种子占位内容 |

**共性问题（适用于全部 4 个组件）**：
- **均无生产环境引用**：`grep` 全仓库确认这 5 个文件（含 `CountUpValue.tsx`，仅被 `StatsCounter` 内部使用）除自身定义外，无任何 `import`。
- **均属于项目最初的"首页板块草稿集合"**：`git log --all -S <组件名> -- "frontend/src/app/(site)/page.tsx"` 对每个组件单独核查，均显示**自初始 commit 起从未被首页引用过**，不存在"曾经用过后来下线"的历史，也**没有任何 commit message、代码注释、TODO 标注过未来接入计划**——找不到"明确未来用途"的证据。
- **均无测试引用**（见第 4 节的测试检索结果，同样适用于这 4 个组件）。
- **均不含硬编码虚假数字**——数字本身来自 props（即数据库字段），组件代码里没有写死任何数值；但其**唯一的数据来源**（`SiteSetting.stats`/`oemProcessSteps`/`factoryStats`/`partnerRegions`）目前存的正是 `seed.ts` 里的占位数据（"10+"/"30+"/"1,000,000+"/"20,000 sqm"/"150+"等），如果不经审查直接启用组件，等同于把未经证实的产能/规模数据发布到正式网站——**与本报告"不编造工厂年限、出口数量、客户数量、产能"的产品决策直接冲突**，这是不接入这些组件的另一个独立理由（不仅是"暂不接入"的产品决策，也是内容真实性层面的硬约束）。
- **均不包含指向不存在页面的链接**：4 个组件内部均无 `<a>`/`<Link>` 元素，纯展示性组件，不存在死链风险。
- **均不包含"未使用图片"意义上的静态资源**：组件本身不内置任何图片资源（图片路径同样来自 props/数据库），不存在需要单独清理的图片文件。

---

## 9. 每个组件的保留或删除建议

| 组件 | 建议分类 |
| --- | --- |
| `FactoryStrength.tsx` | **高概率可以删除，但需要确认**——功能与 About Us 现有图集重复，且信息量更弱，短期内看不到被启用的合理场景 |
| `OemProcess.tsx` | **暂时保留**——虽然当前无用，但"OEM/ODM 服务流程"是可能有商业价值的独立板块（不同于 Factory 图集），且实现代价不高；若业务方未来想在首页/OEM 相关内容中展示服务流程，可以复用，但需要先确认 6 步流程数据的真实性、补上西语国际化文案 |
| `StatsCounter.tsx` | **暂时保留**——数字滚动条是常见且轻量的首页信任背书板块，组件实现干净（无依赖问题），但同样需要业务方先提供真实、可核实的数字后才能考虑启用 |
| `GlobalPartners.tsx` | **高概率可以删除，但需要确认**——地区标签云信息密度低，且"合作区域"这类信息如果业务方认为有价值，更适合并入 About Us 现有的文字介绍里，而不是单独占用一个首页板块 |
| `CountUpValue.tsx` | 跟随 `StatsCounter.tsx` 的决策——`StatsCounter` 保留则它保留（是其唯一消费者），`StatsCounter` 删除则它一并成为高概率删除候选 |

（以上"删除"建议均指"从代码库中移除组件文件"，不涉及数据库字段本身的去留——数据库字段的去留在第 7 节 `factoryPhotos` 和本节以外的 `stats`/`oemProcessSteps`/`factoryStats`/`partnerRegions` 需要单独评估，本报告未展开这几个字段各自的独立分析，只在第 7 节针对 `factoryPhotos` 做了完整评估，因为这是用户本轮明确要求的范围。）

---

## 10. 推荐的四个整改批次和风险

| 批次 | 内容 | 风险 | 是否需要 migration | 是否需要修改生产数据库 |
| --- | --- | --- | --- | --- |
| **B1：修复首页 Placeholder** | 纯内容操作：①在 `/admin/homepage` 用真实文案替换英文 `coreAdvantages` 三段文字；②在 `/admin/settings/i18n` 同步更新或清空对应西语翻译 | 极低——不涉及任何代码改动，只是后台内容录入操作；**注意事项**：需要业务方提供真实、保守的 B2B 文案（如实际的 OEM/ODM 经验年限、质检流程说明、发货物流范围），不能编造具体年限/数量/产能数字 | 否 | 是（但属于业务方通过后台正常操作写入数据，不是工程侧直接改库） |
| **B2：移除旧结构化 slug** | 修改 3 个文件（见第 4 节）：从 `STRUCTURED_JSON_SLUGS` 移除 `factory`/`oem-odm`，`PAGE_LABELS` 移除对应 2 条 | 低——纯代码改动，不改数据库，不改路由，不影响 `about` 及其他 7 个 Page；影响面仅限于后台「页面管理」里这两条记录的表单展示形态（从 JSON 编辑器退化为普通 HTML/文本编辑器） | 否 | 否 |
| **B3：`factoryPhotos` 决策** | 第一阶段仅：在后台隐藏或移除 `/admin/homepage` 里的"工厂图片地址"表单字段入口（`HomepageForm.tsx` 第 86-88 行），**不删除数据库字段本身** | 低——纯前端表单改动，字段仍在数据库中，未来若业务方改变主意可随时恢复表单入口；不影响 About Us 现有图集（两者完全独立） | 否（本阶段） | 否 |
| **B4：未接线组件清理** | 待业务方对 `OemProcess`/`StatsCounter` 的"是否有意向未来启用"给出明确答复后，再决定：①`FactoryStrength`/`GlobalPartners`（若确认不再需要）→ `git rm`；②`OemProcess`/`StatsCounter`/`CountUpValue`（若业务方明确无意向）→ 一并清理，或保留等待数据就绪后再启用 | 低——纯代码删除，组件均无生产引用；**风险点在于时机判断**：若过早删除后业务方又想启用，需要重新开发（虽然可以从 Git 历史找回，但会打断连续性），建议放在四个批次中**最后执行**，给业务方留出决策窗口 | 否 | 否 |

**批次间独立性**：四个批次涉及的文件完全不重叠（B1 是数据操作，B2 是 3 个 admin 页面文件，B3 是 1 个表单文件的入口隐藏，B4 是删除 4-5 个从未被引用的组件文件），可以任意顺序独立执行、独立验证、独立提交、独立回滚，互不阻塞。

---

## 11. 是否需要 Prisma migration

**四个批次均不需要**。

- B1（内容修复）：数据写入现有字段，不改表结构。
- B2（移除旧 slug 判定）：纯前端代码改动，不涉及 Prisma。
- B3（隐藏 `factoryPhotos` 表单入口）：字段继续保留在 `SiteSetting` 表中，只是不再暴露编辑入口；**只有将来业务方最终决定彻底删除该字段时**，才需要一次 `DROP COLUMN` migration——但那已经超出本报告"下一阶段优先级"的范围，且用户已明确本轮"不要为了一个孤儿字段立即创建 migration"。
- B4（组件清理）：纯前端文件删除，不涉及数据库。

---

## 12. 是否需要修改生产数据库

**除 B1（业务方通过后台正常保存内容，这是产品的既有功能，不是工程侧的数据库改造）外，B2/B3/B4 均不需要修改生产数据库**，也不涉及任何 Page 表记录、导航记录的增删改——完全符合用户"Page 表中的历史记录暂时保留，不在本批次删除生产数据"、"不修改导航数据库记录"的既定决策。

---

## 13. 是否发现线上版本与仓库 HEAD 不一致

**未发现不一致的证据**，但受限于本次只能通过公开 HTTP 请求做黑盒验证（未接触生产服务器/容器，无法直接读取服务器上实际部署的 Git SHA），以下是本次验证到的具体对照点：

| 验证点 | 线上实况 | 代码库对应状态 | 结论 |
| --- | --- | --- | --- |
| `/factory`、`/oem-odm` 路由 | 均返回 "Page Not Found" | 已在提交 `a6a2b95`（2026-07-29）删除对应路由文件 | 一致 |
| `/contact` 页面地图 iframe | `src` 参数为纯 `companyAddress` 查询（未拼接公司名），`&hl=en`，`title="Factory address map"` | 与提交 `378490a`（本次审计系列的基线 commit）的最终代码逐字符一致 | 一致 |
| 首页 Core Advantages 占位文案 | "Placeholder — years of OEM/ODM manufacturing experience" 等 | 与 `backend/prisma/seed.ts` 的种子默认值逐字符一致 | 一致（且证明该字段从未被后台保存覆盖过） |
| About Us 图片墙（英西双语） | 16 张图 + 编号 + 双语标题说明，图片文件相同 | 符合 `about/page.tsx` 当前代码架构（`sections`/`bodyHtml` 原样 HTML 渲染） | 一致 |

四项黑盒验证均与代码库当前状态（截至本轮报告撰写前的 HEAD）吻合，**没有发现任何页面结构、路由存在性或渲染逻辑上的差异**。但需要明确说明局限性：本次未能验证服务器上部署的精确 Git commit SHA（需要 SSH/宝塔面板访问生产服务器执行 `git rev-parse HEAD` 或检查容器镜像标签，超出本次浏览器只读检查的能力范围），因此"完全一致"这一结论建立在**行为黑盒验证**基础上，不是逐字节的源码比对。如需 100% 确认，建议后续单独安排一次服务器侧核查。

---

## 附：本轮只读检查方式说明

本报告的全部结论均来自以下三类只读操作的交叉验证，未使用任何写入型操作：

1. **浏览器实测**：直接访问 `https://koigatetech.com/`、`/es`、`/about`、`/es/about`、`/contact`、`/factory`、`/oem-odm`，读取渲染后的页面文本、DOM 结构、`<iframe>`/`<img>` 属性、网络请求日志。
2. **代码库只读检索**：`grep`（跨 `frontend/src`、`backend/src`、`backend/test`）确认组件/常量/字符串的引用范围与缺失情况。
3. **Git 历史只读查询**：`git log --all -S <关键词>`、`git show --stat`、`git show <commit>:<path>` 定位 `a6a2b95`（删除 Factory/OEM-ODM 路由）、`c5423db`/`204cc7b`（两个一次性脚本的创建提交）等关键提交的确切内容和时间点。

本报告未连接、未查询任何数据库（包括本机开发库与生产库），第 1-6、13 节涉及的"线上数据"均来自公开可访问的网页渲染结果，不涉及任何需要鉴权才能查看的后台/数据内容。
