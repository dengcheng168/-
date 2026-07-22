import type { Metadata } from 'next';
import '../globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnalyticsPixels } from '@/components/analytics/AnalyticsPixels';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { getPublicBaseMetadata } from '@/lib/seo/base-metadata';

// 独立的根 layout（跟 (site)/layout.tsx 是姐妹关系，app/ 顶层已经没有共享的 layout.tsx 了），
// 服务端首次响应就直接输出 <html lang="es">——不再需要客户端 hydration 后再改 lang
// （旧的 SetHtmlLang 组件已删除）。openGraph.locale 也在这里统一设成 'es'，跟 getPublicBaseMetadata
// 内部按 locale 参数分支的逻辑保持一致。
export async function generateMetadata(): Promise<Metadata> {
  return getPublicBaseMetadata('es');
}

export default function SpanishSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AnalyticsPixels locale="es" />
        <PageViewTracker />
        <Header locale="es" />
        <main className="flex-1">{children}</main>
        <Footer locale="es" />
      </body>
    </html>
  );
}
