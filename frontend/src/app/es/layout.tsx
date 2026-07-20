import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnalyticsPixels } from '@/components/analytics/AnalyticsPixels';

export default function SpanishSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnalyticsPixels />
      <Header locale="es" />
      <main className="flex-1">{children}</main>
      <Footer locale="es" />
    </>
  );
}
