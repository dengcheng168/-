import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import type { FactoryGalleryItem } from '@/types/content';

export function FactoryGallery({ items, locale = 'en' }: { items: FactoryGalleryItem[]; locale?: Locale }) {
  if (items.length === 0) return null;

  return (
    <section className="py-4">
      <Container>
        <SectionHeading
          eyebrow={t(locale, 'sectionFactoryGalleryEyebrow')}
          title={t(locale, 'sectionFactoryGalleryTitle')}
          description={t(locale, 'sectionFactoryGalleryDescription')}
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-lg border border-grey-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-grey-50">
                <Image
                  src={item.imageUrl ?? '/images/placeholders/product-placeholder.svg'}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white/85 px-2 text-xs font-bold text-navy-950">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="flex flex-1 flex-col border-t-2 border-water-500 p-5">
                <h3 className="text-base font-semibold text-navy-950">{item.title}</h3>
                {item.description && <p className="mt-2 text-sm text-grey-500">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
