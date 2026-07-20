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
    // 不设置就不传 icons 字段，Next.js 会回退到 app/favicon.ico 静态文件约定
    ...(settings.faviconUrl ? { icons: { icon: settings.faviconUrl } } : {}),
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
