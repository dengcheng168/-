import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';
import { t } from '@/lib/i18n/site-strings';

interface AdjacentProduct {
  slug: string;
  name: string;
  sku: string | null;
  image: string;
}

function NavCard({
  product,
  direction,
  label,
  locale,
}: {
  product: AdjacentProduct;
  direction: 'previous' | 'next';
  label: string;
  locale: Locale;
}) {
  const isNext = direction === 'next';

  const thumb = (
    <span className="relative h-14 w-14 shrink-0 overflow-hidden border border-grey-200 bg-grey-50">
      <Image src={product.image} alt="" fill sizes="56px" className="object-contain" />
    </span>
  );
  const arrow = (
    <span
      aria-hidden="true"
      className={`shrink-0 text-xl text-water-600 transition-transform ${
        isNext ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'
      }`}
    >
      {isNext ? '→' : '←'}
    </span>
  );
  const content = (
    <span className="min-w-0">
      <span className="block text-[11px] font-bold uppercase tracking-wide text-grey-500">{label}</span>
      <span className="mt-0.5 block truncate text-base font-extrabold text-navy-950">{product.sku || product.name}</span>
      {product.sku && <span className="mt-0.5 block truncate text-xs text-grey-500">{product.name}</span>}
    </span>
  );

  return (
    <Link
      href={localeHref(`/products/${product.slug}`, locale)}
      rel={isNext ? 'next' : 'prev'}
      className={`group flex min-h-[88px] min-w-0 items-center gap-3.5 bg-white px-5 py-3.5 transition-colors hover:bg-water-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-water-500 ${
        isNext ? 'justify-end text-right' : ''
      }`}
    >
      {isNext ? (
        <>
          {content}
          {thumb}
          {arrow}
        </>
      ) : (
        <>
          {arrow}
          {thumb}
          {content}
        </>
      )}
    </Link>
  );
}

export function ProductPrevNextNav({
  prev,
  next,
  locale = 'en',
}: {
  prev: AdjacentProduct | null;
  next: AdjacentProduct | null;
  locale?: Locale;
}) {
  if (!prev && !next) return null;
  const bothPresent = Boolean(prev) && Boolean(next);

  return (
    <nav
      aria-label={t(locale, 'productNavigationLabel')}
      className="mt-10 border-y border-grey-200"
    >
      <div className={`grid grid-cols-1 ${bothPresent ? 'sm:grid-cols-2' : ''}`}>
        {prev && (
          <div className={bothPresent ? 'sm:border-r sm:border-grey-200' : ''}>
            <NavCard product={prev} direction="previous" label={t(locale, 'previousProduct')} locale={locale} />
          </div>
        )}
        {next && <NavCard product={next} direction="next" label={t(locale, 'nextProduct')} locale={locale} />}
      </div>
    </nav>
  );
}
