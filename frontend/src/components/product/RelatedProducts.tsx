import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGrid } from './ProductGrid';
import type { Product } from '@/types/product';
import type { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/site-strings';

export function RelatedProducts({ products, locale = 'en' }: { products: Product[]; locale?: Locale }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionHeading title={t(locale, 'relatedProducts')} align="left" />
      <div className="mt-6">
        <ProductGrid products={products} locale={locale} />
      </div>
    </section>
  );
}
