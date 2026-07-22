import type { Metadata } from 'next';
import '../globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnalyticsPixels } from '@/components/analytics/AnalyticsPixels';
import { getPublicBaseMetadata } from '@/lib/seo/base-metadata';

// (site) 现在是一个根 layout（app/ 顶层不再有共享的 layout.tsx，见该文件被删除时的提交说明），
// 负责声明英文站自己的 <html lang="en">。这是为了让西语页面能在服务端首次响应里就输出
// <html lang="es">（es/layout.tsx 是另一个独立的根 layout），而不是像之前那样用客户端脚本
// hydrate 后再改——两边各管各的 <html>，互不影响，英文这边的值和之前完全一样。
export async function generateMetadata(): Promise<Metadata> {
  return getPublicBaseMetadata('en');
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AnalyticsPixels />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
