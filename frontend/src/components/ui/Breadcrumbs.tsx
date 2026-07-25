import Link from 'next/link';
import type { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/site-strings';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, locale = 'en' }: { items: Crumb[]; locale?: Locale }) {
  return (
    <nav aria-label={t(locale, 'breadcrumbLabel')} className="text-sm text-grey-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-navy-900">
                {item.label}
              </Link>
            ) : (
              <span className="text-grey-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
