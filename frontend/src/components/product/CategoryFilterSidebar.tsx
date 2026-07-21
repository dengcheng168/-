import Link from 'next/link';
import type { ProductCategory } from '@/types/product';
import type { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/site-strings';
import { localeHref } from '@/lib/i18n/paths';

export function CategoryFilterSidebar({
  categories,
  activeSlug,
  locale = 'en',
}: {
  categories: ProductCategory[];
  activeSlug?: string;
  locale?: Locale;
}) {
  return (
    <nav aria-label="Product categories" className="space-y-1">
      <Link
        href={localeHref('/products', locale)}
        className={`block rounded-md px-3 py-2 text-sm font-medium ${
          !activeSlug ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-grey-100'
        }`}
      >
        {t(locale, 'allProducts')}
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={localeHref(`/products/category/${category.slug}`, locale)}
          className={`block rounded-md px-3 py-2 text-sm font-medium ${
            activeSlug === category.slug ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-grey-100'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
