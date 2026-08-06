import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import type { FactoryGalleryItem } from '@/types/content';
import { GALLERY_GROUP_ORDER, GALLERY_GROUP_SEQUENCE, type GalleryGroup } from '@/lib/about/gallery-groups';

const GROUP_TITLE_KEY: Record<GalleryGroup, 'aboutGalleryManufacturingTitle' | 'aboutGalleryQualityTitle' | 'aboutGalleryPackagingTitle' | 'aboutGalleryVisitsTitle'> = {
  manufacturing: 'aboutGalleryManufacturingTitle',
  quality: 'aboutGalleryQualityTitle',
  packaging: 'aboutGalleryPackagingTitle',
  visits: 'aboutGalleryVisitsTitle',
};

const GROUP_DESC_KEY: Record<GalleryGroup, 'aboutGalleryManufacturingDesc' | 'aboutGalleryQualityDesc' | 'aboutGalleryPackagingDesc' | 'aboutGalleryVisitsDesc'> = {
  manufacturing: 'aboutGalleryManufacturingDesc',
  quality: 'aboutGalleryQualityDesc',
  packaging: 'aboutGalleryPackagingDesc',
  visits: 'aboutGalleryVisitsDesc',
};

function GalleryGrid({ items }: { items: FactoryGalleryItem[] }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              {index + 1}
            </span>
          </div>
          <div className="flex flex-1 flex-col border-t-2 border-water-500 p-5">
            <h3 className="text-base font-semibold text-navy-950">{item.title}</h3>
            {item.description && <p className="mt-2 text-sm text-grey-500">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FactoryGallery({ items, locale = 'en' }: { items: FactoryGalleryItem[]; locale?: Locale }) {
  if (items.length === 0) return null;
  const byId = new Map(items.map((item) => [item.id, item]));

  return (
    <>
      {GALLERY_GROUP_SEQUENCE.map((group) => {
        const groupItems = GALLERY_GROUP_ORDER[group]
          .map((id) => byId.get(id))
          .filter((item): item is FactoryGalleryItem => Boolean(item));
        if (groupItems.length === 0) return null;

        return (
          <section key={group} className="py-8">
            <Container>
              <h2 className="text-2xl font-semibold text-navy-950">{t(locale, GROUP_TITLE_KEY[group])}</h2>
              <p className="mt-2 max-w-3xl text-grey-500">{t(locale, GROUP_DESC_KEY[group])}</p>
              <GalleryGrid items={groupItems} />
            </Container>
          </section>
        );
      })}
    </>
  );
}
