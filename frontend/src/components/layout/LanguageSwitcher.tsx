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

function LanguageLink({ locale, targetLocale, href }: { locale: Locale; targetLocale: Locale; href: string }) {
  return (
    <Link
      href={href}
      aria-current={locale === targetLocale ? 'page' : undefined}
      className={locale === targetLocale ? 'text-white' : 'text-grey-200/70 hover:text-white'}
    >
      {LOCALE_LABELS[targetLocale]}
    </Link>
  );
}

/** useSearchParams 需要 Suspense 兜底：静态预渲染阶段（尚未 hydrate）先用不保留路径的简单版本。 */
function LanguageSwitcherFallback({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-center gap-1 text-xs font-medium text-grey-200">
      <LanguageLink locale={locale} targetLocale="en" href="/" />
      <span aria-hidden="true" className="text-grey-200/40">
        /
      </span>
      <LanguageLink locale={locale} targetLocale="es" href="/es" />
    </div>
  );
}

function LanguageSwitcherResolved({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  // hash 不在 usePathname/useSearchParams 里，只能读 window；用 useSyncExternalStore
  // 而不是直接在渲染里读 window.location.hash，是为了让首次客户端渲染（hydration）
  // 跟服务端渲染的结果一致（getServerHashSnapshot 固定返回空字符串），避免 mismatch。
  const hash = useSyncExternalStore(subscribeToHashChange, getHashSnapshot, getServerHashSnapshot);

  const hrefFor = (target: Locale) => `${getLocalizedPath(pathname, target)}${qs ? `?${qs}` : ''}${hash}`;

  return (
    <div className="flex items-center gap-1 text-xs font-medium text-grey-200">
      <LanguageLink locale={locale} targetLocale="en" href={hrefFor('en')} />
      <span aria-hidden="true" className="text-grey-200/40">
        /
      </span>
      <LanguageLink locale={locale} targetLocale="es" href={hrefFor('es')} />
    </div>
  );
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={<LanguageSwitcherFallback locale={locale} />}>
      <LanguageSwitcherResolved locale={locale} />
    </Suspense>
  );
}
