# 第三方代码引用说明

## Studio Admin（布局与视觉参考）

- 项目：`next-shadcn-admin-dashboard`（品牌名 "Studio Admin"）
- 仓库：https://github.com/arhamkhnz/next-shadcn-admin-dashboard
- 参考的 commit：`ba4978aabd19cff7131fd0486a1d07d4244cc13c`（2026-07-19，main 分支）
- 许可证：MIT License（版权归属 arhamkhnz 及项目贡献者）

### 实际使用方式

**没有**克隆整个仓库或整套复制其组件代码到本项目。使用方式是：

1. 通过 WebFetch 读取该仓库 `main` 分支在上述 commit 处的 `package.json`、`src/lib/utils.ts`、`src/components/ui/button.tsx` 等少量文件，确认技术栈版本（Next.js 16 / React 19 / Tailwind v4）、`cn()` 工具函数写法、shadcn 组件的标准结构（`data-slot` 属性、`cva` 变体、`class-variance-authority` 用法）。
2. 只有 `frontend/src/lib/utils.ts` 里的 `cn()` 函数是直接参考该仓库对应文件抄录的标准 shadcn 写法（这本身也是 shadcn/ui 生态里近乎逐字重复的公共写法，非该仓库独创）。
3. `frontend/src/components/admin/ui/*` 下的 Button / Badge / Table / Tabs / Dialog / Sheet / DropdownMenu / Breadcrumb / Separator / Skeleton / Input / Label / Tooltip / Toaster 均为本项目按 shadcn/ui 官方文档发布的标准组件形态**重新编写**，针对本项目的 Radix 依赖版本、`@/components/admin/AdminPortalProvider` 弹层挂载点、`--primary`/`--background` 等自定义 token 名称做了适配，不是从该仓库文件逐行复制。
4. 未采用该仓库自带的多套演示 Dashboard（CRM/Finance/Analytics/电商/学院/物流）、chat、email、kanban、calendar 页面，未采用其 `@tanstack/react-table`、`recharts`、`@dnd-kit/*`、`zustand`、`@fullcalendar/react`、`radix-ui` 聚合包、`@base-ui/react`、`biome` 等依赖。

### MIT License 全文（摘自 Studio Admin 仓库）

```
MIT License

Copyright (c) 2024 arhamkhnz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## shadcn/ui 组件模式

本项目 `components/admin/ui/*` 下的组件遵循 shadcn/ui（https://ui.shadcn.com）发布的公共组件模式与 Radix UI（https://www.radix-ui.com，MIT License）无样式交互原语。shadcn/ui 本身不是一个可安装的 npm 包，而是一套推荐直接复制源码到项目里的组件模式，因此这里记录的是"参考的模式来源"而非"依赖的包"。
