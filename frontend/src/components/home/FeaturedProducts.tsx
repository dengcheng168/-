import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';
import type { Product } from '@/types/product';

export function FeaturedProducts({ products, locale = 'en' }: { products: Product[]; locale?: Locale }) {
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow={t(locale, 'sectionFeaturedProductsEyebrow')} title={t(locale, 'sectionFeaturedProductsTitle')} />
        <div className="mt-10">
          <ProductGrid products={products} locale={locale} />
        </div>
        <div className="mt-10 text-center">
          <Button href={localeHref('/products', locale)} variant="outline">
            {t(locale, 'viewAllProducts')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
