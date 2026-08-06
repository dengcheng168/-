import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { FactoryGallery } from '@/components/site/FactoryGallery';
import { WhatWeSupport } from '@/components/site/WhatWeSupport';
import { getPageBySlug, listFactoryGalleryItems } from '@/lib/api/content';
import { t } from '@/lib/i18n/site-strings';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about');
  return {
    title: page?.seoTitle ?? page?.title ?? 'About Us',
    description: page?.seoDescription ?? undefined,
    alternates: { canonical: '/about', languages: { en: '/about', es: '/es/about', 'x-default': '/about' } },
  };
}

export default async function AboutPage() {
  const [page, galleryItems] = await Promise.all([getPageBySlug('about'), listFactoryGalleryItems()]);
  const hasHero = Boolean(page?.heroImage || page?.heroImageMobile);

  return (
    <>
      {hasHero && (
        <PageHeroBanner
          image={page?.heroImage}
          imageMobile={page?.heroImageMobile}
          eyebrow={t('en', 'aboutEyebrow')}
          title={page?.title ?? 'About Us'}
        >
          {page?.bodyHtml && (
            <div
              className="prose prose-sm prose-invert mt-4 max-w-3xl text-grey-100/90"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
          )}
        </PageHeroBanner>
      )}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />
        {!hasHero && (
          <>
            <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? 'About Us'}</h1>
            {page?.bodyHtml && (
              <div
                className="prose prose-sm mt-6 max-w-3xl text-grey-700"
                dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
              />
            )}
          </>
        )}

        {typeof page?.sections === 'string' && page.sections && (
          <div className="mt-10" dangerouslySetInnerHTML={{ __html: page.sections }} />
        )}
      </Container>

      <WhatWeSupport locale="en" />
      <FactoryGallery items={galleryItems} />

      <section className="bg-navy-950 py-14">
        <Container className="text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{t('en', 'aboutCtaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-grey-100/90">{t('en', 'aboutCtaDescription')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="/contact" variant="primary">
              {t('en', 'aboutCtaPrimaryButton')}
            </Button>
            <Button href="/products" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-navy-950">
              {t('en', 'aboutCtaSecondaryButton')}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
