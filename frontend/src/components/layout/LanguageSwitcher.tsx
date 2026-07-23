'use client';

import { Suspense, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Locale } from '@/lib/i18n/locales';
import { LOCALE_LABELS } from '@/lib/i18n/locales';
import { getLocalizedPath } from '@/lib/i18n/localized-path';

function subscribeToHashChange(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function getHashSnapshot() {
  return window.location.hash;
}

function getServerHashSnapshot() {
  return '';
}

type Variant = 'dark' | 'light';

/** dark：深色header背景上用（白字高亮/浅灰未选中）；light：白底菜单（如MobileNav下拉）上用，避免白字在白底上不可见。 */
const VARIANT_CLASSES: Record<Variant, { base: string; active: string; inactive: string; divider: string }> = {
  dark: {
    base: 'text-grey-200',
    active: 'text-white',
    inactive: 'text-grey-200/70 hover:text-white',
    divider: 'text-grey-200/40',
  },
  light: {
    base: 'text-grey-500',
    active: 'text-navy-900',
    inactive: 'text-grey-500 hover:text-navy-900',
    divider: 'text-grey-200',
  },
};

function LanguageLink({
  locale,
  targetLocale,
  href,
  variant,
}: {
  locale: Locale;
  targetLocale: Locale;
  href: string;
  variant: Variant;
}) {
  const classes = VARIANT_CLASSES[variant];
  return (
    <Link
      href={href}
      aria-current={locale === targetLocale ? 'page' : undefined}
      className={locale === targetLocale ? classes.active : classes.inactive}
    >
      {LOCALE_LABELS[targetLocale]}
    </Link>
  );
}

/** useSearchParams 需要 Suspense 兜底：静态预渲染阶段（尚未 hydrate）先用不保留路径的简单版本。 */
function LanguageSwitcherFallback({ locale, variant }: { locale: Locale; variant: Variant }) {
  const classes = VARIANT_CLASSES[variant];
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${classes.base}`}>
      <LanguageLink locale={locale} targetLocale="en" href="/" variant={variant} />
      <span aria-hidden="true" className={classes.divider}>
        /
      </span>
      <LanguageLink locale={locale} targetLocale="es" href="/es" variant={variant} />
    </div>
  );
}

function LanguageSwitcherResolved({ locale, variant }: { locale: Locale; variant: Variant }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  // hash 不在 usePathname/useSearchParams 里，只能读 window；用 useSyncExternalStore
  // 而不是直接在渲染里读 window.location.hash，是为了让首次客户端渲染（hydration）
  // 跟服务端渲染的结果一致（getServerHashSnapshot 固定返回空字符串），避免 mismatch。
  const hash = useSyncExternalStore(subscribeToHashChange, getHashSnapshot, getServerHashSnapshot);

  const hrefFor = (target: Locale) => `${getLocalizedPath(pathname, target)}${qs ? `?${qs}` : ''}${hash}`;
  const classes = VARIANT_CLASSES[variant];

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${classes.base}`}>
      <LanguageLink locale={locale} targetLocale="en" href={hrefFor('en')} variant={variant} />
      <span aria-hidden="true" className={classes.divider}>
        /
      </span>
      <LanguageLink locale={locale} targetLocale="es" href={hrefFor('es')} variant={variant} />
    </div>
  );
}

export function LanguageSwitcher({ locale, variant = 'dark' }: { locale: Locale; variant?: Variant }) {
  return (
    <Suspense fallback={<LanguageSwitcherFallback locale={locale} variant={variant} />}>
      <LanguageSwitcherResolved locale={locale} variant={variant} />
    </Suspense>
  );
}
