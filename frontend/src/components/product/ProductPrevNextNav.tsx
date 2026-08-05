import Link from 'next/link';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';
import { t } from '@/lib/i18n/site-strings';

interface AdjacentProduct {
  slug: string;
  name: string;
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

  return (
    <nav className="mt-10 flex items-stretch justify-between gap-4 border-t border-grey-200 pt-6">
      {prev ? (
        <Link
          href={localeHref(`/products/${prev.slug}`, locale)}
          className="group flex min-w-0 items-center gap-2 text-grey-700 hover:text-water-600"
        >
          <span aria-hidden className="text-lg">
            &larr;
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-grey-500">{t(locale, 'previousProduct')}</span>
            <span className="block truncate text-sm font-medium">{prev.name}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={localeHref(`/products/${next.slug}`, locale)}
          className="group flex min-w-0 items-center gap-2 text-right text-grey-700 hover:text-water-600"
        >
          <span className="min-w-0">
            <span className="block text-xs text-grey-500">{t(locale, 'nextProduct')}</span>
            <span className="block truncate text-sm font-medium">{next.name}</span>
          </span>
          <span aria-hidden className="text-lg">
            &rarr;
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
