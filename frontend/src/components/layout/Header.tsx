import Link from 'next/link';
import Image from 'next/image';
import { getNavigation } from '@/lib/api/navigation';
import { getPublicSettings } from '@/lib/api/settings';
import { getTranslationMap } from '@/lib/api/translations';
import { localizeNavigation } from '@/lib/i18n/content-overlay';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { MobileNav } from './MobileNav';
import { LanguageSwitcher } from './LanguageSwitcher';

export async function Header({ locale = 'en' }: { locale?: Locale } = {}) {
  const [items, settings, translations] = await Promise.all([
    getNavigation(),
    getPublicSettings(),
    locale === 'en' ? Promise.resolve({}) : getTranslationMap(locale),
  ]);
  const navItems = locale === 'en' ? items : localizeNavigation(items, translations);
  const homeHref = locale === 'en' ? '/' : `/${locale}`;

  return (
    <header className="sticky top-0 z-50 bg-navy-950">
      <Container className="relative flex h-16 items-center justify-between">
        <Link href={homeHref} className="flex items-center gap-2 text-lg font-semibold text-white">
          {settings.companyLogoUrl ? (
            <span className="relative block h-9 w-40">
              <Image
                src={settings.companyLogoUrl}
                alt={settings.companyName || 'Water Purifier Factory'}
                fill
                sizes="160px"
                className="object-contain object-left"
                priority
              />
            </span>
          ) : (
            settings.companyName || 'Water Purifier Factory'
          )}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              target={item.openInNewTab ? '_blank' : undefined}
              className="text-sm font-medium text-grey-200 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:ml-6 md:flex">
          <LanguageSwitcher locale={locale} />
          <Button href="/contact" className="!px-4 !py-2">
            {t(locale, 'headerCta')}
          </Button>
        </div>

        <MobileNav items={navItems} locale={locale} />
      </Container>
    </header>
  );
}
