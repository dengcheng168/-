# 多语言支持 — 第一批：西班牙语

## 背景与范围裁剪说明

用户要求"先做一个西班牙语"。给了两轮范围澄清问题（翻译全站 vs. 只做核心静态页面 vs. 只做导航/页脚框架）都被
用户跳过（未作答），按 auto-mode 的原则理解为"不用再问了，自己拿主意"。最终选择的范围（本文档记录理由，
供后续验证）：**Hero 文案 + 导航菜单 + FAQ 问答 + 站点 UI 框架文案**，不做产品/博客/关于我们/联系我们/证书/
隐私政策/使用条款的内容翻译。

选择理由：
- Hero + 导航 + FAQ 覆盖了访客进站后最先看到、结构最简单、字段数量可枚举的部分，一次会话内能做到"真实可用"
  而不是"看起来能用"。
- 产品/博客是数据量大、字段结构复杂（富文本正文、JSON 规格数组等）的内容，翻译这些需要单独的批次和更大的
  数据模型改动，仓促做容易产出半成品。
- 首页 Hero 下方的核心优势/统计数字/OEM流程/工厂实力/合作地区几个板块，其内容存在 `SiteSetting` 的 JSON 数组
  字段里（`coreAdvantages`/`stats`/`oemProcessSteps`/`factoryStats`/`partnerRegions`），本批次**没有**翻译这些
  JSON 数组内部的字段，只翻译了这几个板块共用的"版块标题/eyebrow"（属于代码里的 UI 框架文案，不是这些字段
  本身）。这几个板块目前在 `/es` 首页上会保留英文内容，是已知且明确记录的范围之外项。

## 一、技术方案

### 两类文案，两种存储方式

1. **后台可编辑内容的译文**（Hero 文案、导航菜单标签、FAQ 问答）→ 新增 `Translation` 表（
   `backend/prisma/schema.prisma`），`{ locale, key, value }`，`@@unique([locale, key])`。**只存非英文的覆盖
   值**，英文内容仍然是各自内容表（`SiteSetting`/`NavigationItem`/`Faq`）里的原始字段，没有做"每个字段建一张
   `_translations` 关联表"这种更重的方案——量小（几十个 key）时一张 key-value 表更简单，也更容易在后台做成
   一个统一的编辑页面。
2. **写死在代码里的 UI 框架文案**（导航"Get a Quote"按钮、页脚"Quick Navigation"/"Categories"/"Contact Us"等
   标签、首页各板块的 eyebrow/title、FAQ 页面包屑等）→ `frontend/src/lib/i18n/site-strings.ts`，一份英西对照
   的常量字典，不经过数据库，因为这些不是后台可编辑内容。

### key 命名规则

`settings.heroHeadline` / `settings.heroSubheadline` / `settings.heroButton1Text` / `settings.heroButton2Text`；
`nav.<NavigationItem.id>.label`；`faq.<Faq.id>.question` / `faq.<Faq.id>.answer`。value 为空字符串时后端会
直接删除这一行（`upsertTranslations()`），不会插入空值——对应"清除译文，回退显示英文原文"。

### 路由结构：新增 `/es` 前缀，不改动任何现有英文路由

选择方案：新建 `frontend/src/app/es/` 目录（`layout.tsx` + `page.tsx` + `faq/page.tsx`），复用跟英文版**完全
相同**的数据获取函数和展示组件，只是多传一个 `locale="es"` 参数、多 fetch 一份 `getTranslationMap('es')`
做叠加。**没有**采用 Next.js 标准的 `app/[locale]/...` 动态段重构方案——那需要把现有几十个英文路由文件全部
挪到 `[locale]` 段下面，对已经上线的生产站点（koigatetech.com）改动面和风险都大得多。当前方案的代价是：
以后每加一个语言版本页面，需要新建一个对应的 `/es/xxx/page.tsx` 文件，而不是自动获得所有语言版本；这是一个
已知的可扩展性取舍，写在这里供后续参考。

`Header`/`Footer`/`MobileNav` 以及首页的 9 个板块组件（`ProductCategories`/`FeaturedProducts`/
`CertificatesShowcase`/`LatestBlogPosts`/`FaqPreview`/`InquirySection`/`CoreAdvantages` 等）都新增了一个可选
的 `locale?: Locale`（默认 `'en'`）参数——不传就是原来的英文行为，现有英文路由的调用方（`(site)/page.tsx`
等）一个字符都没改，不存在"改了这个功能顺带影响英文站"的风险。

### 语言切换器（`LanguageSwitcher.tsx`）

固定在 Header 里，链接是 `/` ↔ `/es`，**不会**试图保留当前子页面路径（比如在产品详情页点切换语言不会跳到一
个不存在的西班牙语产品详情页）。原因：目前只有首页和 FAQ 页有西班牙语版本，如果切换器尝试猜测"当前页面的
西班牙语版本"，在没有对应页面时会产生大量 404，那是比"统一跳回对应语言首页"更差的体验。这是一个诚实、简单
的第一版实现，后续扩展更多语言页面时需要同步增强这里的逻辑（比如按路径映射表决定跳转目标）。

## 二、权限

`translations` 加入 `backend/src/config/permissions.ts` 的 `CONTENT_RESOURCES`，即 `SUPER_ADMIN` 和
`CONTENT_ADMIN` 可读写，`SALES` 不行——跟产品/博客等内容资源同一档，因为翻译文案属于内容工作，不属于系统
设置或管理员管理。已用真实 HTTP 请求验证：`SALES` 拿 `403`，`CONTENT_ADMIN` 拿 `200`（见下方"真实验证"）。

## 三、真实浏览器 + 真实 HTTP 验证（不是假设）

1. 登录后台，打开 `/admin/settings/i18n`，填写 Hero 4 个字段的西班牙语译文（主标题/副标题/按钮一/按钮二），
   点击"保存全部译文"，页面显示"已保存，前台西班牙语页面已刷新"。
2. 打开 `/es`，Hero 区域显示刚填写的西班牙语文案（"Fabricante OEM y ODM de Purificadores de Agua"等），
   Header CTA 按钮显示"Solicitar Cotización"（来自 `site-strings.ts`），语言切换器显示"English / Español"。
   截图确认无误。
3. 验证过程中发现一个真实的样式 bug：语言切换器加入后，在约 900px 视口宽度下会跟导航最后一项"Contact"紧贴
   在一起没有间距——已修复（`Header.tsx` 给右侧切换器+按钮的容器加 `md:ml-6`），修复后截图确认间距恢复正常。
4. 打开 `/es/faq`：面包屑"Inicio / Preguntas Frecuentes"、标题"Preguntas Frecuentes"正确显示西班牙语；FAQ
   问答本身（未翻译）正确回退显示英文原文（"Do you support OEM and ODM services?"等），不是空白也不是假数据。
5. 用真实 HTTP 请求给 FAQ #1 的问题字段写入西班牙语译文，重新请求 `/es/faq`，确认页面里西班牙语译文出现、
   原英文问题不再出现——证明 FAQ 覆盖逻辑（`localizeFaqs()`）跟 Hero 覆盖逻辑走的是同一套 `translate()`
   函数，同样正确工作。
6. 用真实 HTTP 请求验证权限：新建一个 `SALES` 测试账号访问 `GET /api/admin/translations` → `403`；新建一个
   `CONTENT_ADMIN` 测试账号访问同一接口 → `200`。测试账号已清理。
7. 查数据库确认 `AuditLog` 表里生成了 `translations.update` 记录，`metadata` 字段里记录了本次改动涉及的
   所有 key、写入了几条、清除回退了几条——符合"日志内容只留必要字段"的既有约定。
8. 深色模式：`/admin/settings/i18n` 页面在深色模式下正确渲染，之前保存的译文正确回显在输入框里（验证了
   "保存后能正确读回"，不只是"写入成功"）。
9. `/`（英文首页）截图确认样式和内容完全未受影响。

## 四、测试与构建结果

```
backend npm test:        43 pass / 0 fail
backend npm run lint:    通过
backend npm run build:   通过
frontend npm run lint:   通过
frontend npx tsc --noEmit: 通过
```

`frontend npm run build`：本批次开发过程中完整跑过一次并成功（`/es`、`/es/faq` 正确生成为静态 ISR 路由，
revalidate 分别是 1 分钟和 5 分钟，和其它静态页面一致）。该次构建之后又对 `Header.tsx` 做了一处样式类名
微调（`md:ml-6`，修复上面提到的间距 bug），出于避免再次破坏本地开发服务器缓存（当时 `next build` 覆盖了
正在运行的 `next dev` 的 `.next` 目录，导致开发服务器报 `ENOENT`/写冲突，需要停服清目录重启才恢复）的考虑，
这一处小改动之后没有再重新跑一次完整生产构建——已经用 `tsc --noEmit`（干净）和真实浏览器里 Turbopack 热更新
后的实际渲染结果（间距确实修复，截图见验证记录）交叉确认过这处改动没有引入新问题，但**没有**用生产构建
本身再验证一次，如实记录这个尾巴。

## 五、未实施范围（明确列出，不假装完成）

- 产品、博客文章：完全未翻译，`/products`、`/blog` 及其子路由没有西班牙语版本。
- About Us / Contact Us / Certificates / Privacy Policy / Terms of Use：没有 `/es/xxx` 版本；西班牙语页脚
  的"隐私政策"/"使用条款"/"联系我们"链接文字虽然是西班牙语，但点击后跳转到的仍然是这几个页面的英文原版
  （诚实处理：不假装存在一个西语页面）。
- 首页 Hero 下方的核心优势/统计数字/OEM流程/工厂实力/合作地区几个板块：只翻译了板块标题，板块内部的具体
  文字内容（存在 `SiteSetting` 的 JSON 数组字段里）未翻译，`/es` 首页这几处会显示英文内容。
- `<html lang="...">` 属性：目前固定在根 `layout.tsx` 里写死 `lang="en"`，`/es` 路由下的页面依然是
  `lang="en"`——技术上对无障碍/SEO 不是最优（正确做法应该是 `/es` 下的页面标 `lang="es"`），但要做对需要把
  `[locale]` 段挪到根布局层面才能让根 layout 拿到 locale 参数，属于上面"路由结构"里提到的更大重构，本批次
  没有做，作为已知限制记录。已经用 `generateMetadata` 的 `alternates.languages` 做了英西互链，缓解一部分
  SEO 影响。
- 语言切换器不记忆"用户上次选择的语言"（无 Cookie/localStorage 持久化），每次都是从当前页面的语言状态出发。
- 只有一种非英语语言（西班牙语）。`SUPPORTED_LOCALES` 常量（前后端各一份，需要保持同步）设计为数组，加
  下一个语言时的改动点已经在代码注释里标出，但目前只验证过西班牙语这一种取值。

## 六、风险与后续建议

- 前后端各维护一份 `SUPPORTED_LOCALES`（`backend/src/modules/translations/translations.schema.ts` 和
  `frontend/src/lib/i18n/locales.ts`），加新语言时两处都要改，忘改一处会导致该语言的译文能保存但前台读不到
  （或反过来）。后续如果语言数量增多，值得考虑改成一份共享配置或者至少加一个自动化测试断言两边一致。
- `/es` 路由是手工新建的独立文件，不是从 `[locale]` 动态段自动派生的，每加一个可翻译页面都需要手动新建
  对应的 `/es/xxx/page.tsx` 并记得传 `locale="es"`，容易漏改；如果后续要覆盖更多页面（尤其是产品/博客这种
  大批量动态路由），建议在那之前先做前面提到的 `[locale]` 段重构，否则会有大量重复的路由文件。
- Hero 板块下方那几个 JSON 数组字段（核心优势/统计/OEM流程/工厂实力/合作地区）如果要翻译，需要设计"数组
  内第 N 项"的 key 命名方式（比如 `settings.coreAdvantages.0.title`），并且要接受"管理员在英文后台重新排序
  这些项目后，已保存的译文会错位"这个副作用（因为现在是按数组下标关联，不是按稳定 ID），这个取舍需要在
  正式做之前跟需求方确认是否可以接受。
