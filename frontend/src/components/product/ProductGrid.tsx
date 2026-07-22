import type { Product } from '@/types/product';
import type { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/site-strings';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, locale = 'en' }: { products: Product[]; locale?: Locale }) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-grey-500">{t(locale, 'noProductsFound')}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
