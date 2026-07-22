import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnalyticsPixels } from '@/components/analytics/AnalyticsPixels';
import { SetHtmlLang } from '@/components/layout/SetHtmlLang';

// 默认 Open Graph locale：整个 /es 子树共用，覆盖根 layout 的 { locale: 'en' }（按字段整体
// 替换，不是深度合并）。/es 下少数自己声明了 openGraph 的页面（首页、产品详情、文章详情）
// 会再各自覆盖一层，同样要记得带上 locale，见那几个文件里的注释。
export const metadata: Metadata = {
  openGraph: { locale: 'es', alternateLocale: 'en' },
};

export default function SpanishSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SetHtmlLang lang="es" />
      <AnalyticsPixels locale="es" />
      <Header locale="es" />
      <main className="flex-1">{children}</main>
      <Footer locale="es" />
    </>
  );
}
