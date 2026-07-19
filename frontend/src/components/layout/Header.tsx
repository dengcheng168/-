import Link from 'next/link';
import Image from 'next/image';
import { getNavigation } from '@/lib/api/navigation';
import { getPublicSettings } from '@/lib/api/settings';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { MobileNav } from './MobileNav';

export async function Header() {
  const [items, settings] = await Promise.all([getNavigation(), getPublicSettings()]);

  return (
    <header className="sticky top-0 z-50 border-b border-grey-200 bg-white/95 backdrop-blur">
      <Container className="relative flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-navy-950">
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
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              target={item.openInNewTab ? '_blank' : undefined}
              className="text-sm font-medium text-grey-700 transition-colors hover:text-navy-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href="/contact" className="!px-4 !py-2">
            Get a Quote
          </Button>
        </div>

        <MobileNav items={items} />
      </Container>
    </header>
  );
}
