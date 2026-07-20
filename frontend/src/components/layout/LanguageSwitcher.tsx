import Link from 'next/link';
import type { Locale } from '@/lib/i18n/locales';
import { LOCALE_LABELS } from '@/lib/i18n/locales';

/**
 * 目前只有首页和 FAQ 页有西班牙语版本（见 lib/i18n/locales.ts 的 SUPPORTED_LOCALES 和实施文档里的
 * "未翻译范围"说明），所以这里没有做到"保留当前子页面、只切语言前缀"——切换语言统一回到对应语言的首页，
 * 这是诚实的做法：假装每个子页面都有对应语言版本会导致大量 404。后续扩展更多语言页面时再增强这里。
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-center gap-1 text-xs font-medium text-grey-200">
      <Link
        href="/"
        aria-current={locale === 'en' ? 'page' : undefined}
        className={locale === 'en' ? 'text-white' : 'text-grey-200/70 hover:text-white'}
      >
        {LOCALE_LABELS.en}
      </Link>
      <span aria-hidden="true" className="text-grey-200/40">
        /
      </span>
      <Link
        href="/es"
        aria-current={locale === 'es' ? 'page' : undefined}
        className={locale === 'es' ? 'text-white' : 'text-grey-200/70 hover:text-white'}
      >
        {LOCALE_LABELS.es}
      </Link>
    </div>
  );
}
