import type { Metadata } from 'next';
import './globals.css';
import { getPublicSettings } from '@/lib/api/settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    title: {
      default: 'OEM & ODM Water Purifier Manufacturer',
      template: '%s | Water Purifier Factory',
    },
    description:
      'Reliable water purification solutions for global brands, distributors and commercial projects.',
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
