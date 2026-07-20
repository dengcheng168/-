import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function SpanishSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="es" />
      <main className="flex-1">{children}</main>
      <Footer locale="es" />
    </>
  );
}
