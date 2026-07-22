import type { Metadata } from 'next';
import './globals.css';
import { getPublicSettings } from '@/lib/api/settings';
import { getSiteUrl } from '@/lib/seo/site';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    // 让所有页面里写的相对路径 canonical/alternates.languages/openGraph.images 都能正确
    // 解析成完整绝对 URL（Next.js 官方推荐做法：只在根 layout 配一次 metadataBase，不用在
    // 每个页面文件里手写 https://koigatetech.com 这种硬编码域名）。开发环境仍然回退到
    // getSiteUrl() 自己的 localhost 兜底，行为不变。
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: 'OEM & ODM Water Purifier Manufacturer',
      template: '%s | Water Purifier Factory',
    },
    description:
      'Reliable water purification solutions for global brands, distributors and commercial projects.',
    // 默认 Open Graph locale：只有英文页面才会真正用到这个默认值——/es 子树在 es/layout.tsx
    // 里重新声明了一份 { locale: 'es', alternateLocale: 'en' }，会整体覆盖这里（Next.js
    // 的 metadata 合并是按字段整体替换，不是深度合并，所以每一层"自己声明了 openGraph"
    // 就必须自己把 locale 也带上，不能指望从祖先继承单个字段）
    openGraph: { locale: 'en', alternateLocale: 'es', siteName: settings.companyName || 'Water Purifier Factory' },
    // 必须显式传 icons，不能依赖 app/favicon.ico 的文件约定兜底：Next.js 文档明确说文件约定
    // 的图标优先级高于 metadata/generateMetadata 里配置的 icons，两者会同时输出成两个
    // <link rel="icon">，而浏览器实测会优先选中文件约定那个，导致后台传了新图标也不生效。
    // 所以把默认图标挪到 public/favicon.ico（普通静态文件，不触发文件约定），这里始终只输出
    // 一个 icons.icon，未设置自定义图标时兜底指向它
    icons: { icon: settings.faviconUrl || '/favicon.ico' },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
