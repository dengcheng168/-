import Image from 'next/image';
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Product } from '@/types/product';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';
import { t } from '@/lib/i18n/site-strings';

function RelatedCard({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <Link
      href={localeHref(`/products/${product.slug}`, locale)}
      className="group flex flex-col overflow-hidden rounded-lg border border-grey-200 bg-white transition-all hover:-translate-y-1 hover:border-water-300 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-grey-200 bg-grey-50">
        <Image
          src={product.mainImage}
          alt={product.galleryImages[0]?.alt?.trim() || product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="block truncate text-[11px] font-bold uppercase tracking-wide text-water-600">
            {product.category.name}
          </span>
        )}
        <h3 className="mt-1.5 line-clamp-2 text-base font-semibold leading-snug text-navy-950">{product.name}</h3>
        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-grey-500">{product.shortDescription}</p>
        )}
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-water-600">
          {t(locale, 'viewProduct')} <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  );
}

export function RelatedProducts({ products, locale = 'en' }: { products: Product[]; locale?: Locale }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-grey-200 pt-8 lg:mt-16 lg:pt-10">
      <SectionHeading title={t(locale, 'relatedProducts')} />
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <RelatedCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}
