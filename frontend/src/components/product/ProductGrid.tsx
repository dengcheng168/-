import type { Product } from '@/types/product';
import type { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/site-strings';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, locale = 'en' }: { products: Product[]; locale?: Locale }) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-grey-500">{t(locale, 'noProductsFound')}</p>;
  }

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {products.map((product) => (
        <div key={product.id} className="w-[calc(50%-12px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]">
          <ProductCard product={product} locale={locale} />
        </div>
      ))}
    </div>
  );
}
