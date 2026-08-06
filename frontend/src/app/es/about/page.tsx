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
  const page = await getPageBySlug('about', 'es');
  return {
    title: page?.seoTitle ?? page?.title ?? t('es', 'aboutPageTitle'),
    description: page?.seoDescription ?? undefined,
    alternates: { canonical: '/es/about', languages: { en: '/about', es: '/es/about', 'x-default': '/about' } },
  };
}

export default async function SpanishAboutPage() {
  const [page, galleryItems] = await Promise.all([getPageBySlug('about', 'es'), listFactoryGalleryItems('es')]);
  const hasHero = Boolean(page?.heroImage || page?.heroImageMobile);

  return (
    <>
      {hasHero && (
        <PageHeroBanner
          image={page?.heroImage}
          imageMobile={page?.heroImageMobile}
          eyebrow={t('es', 'aboutEyebrow')}
          title={page?.title ?? t('es', 'aboutPageTitle')}
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
        <Breadcrumbs items={[{ label: t('es', 'breadcrumbHome'), href: '/es' }, { label: t('es', 'breadcrumbAbout') }]} locale="es" />
        {!hasHero && (
          <>
            <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? t('es', 'aboutPageTitle')}</h1>
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

      <WhatWeSupport locale="es" />
      <FactoryGallery items={galleryItems} locale="es" />

      <section className="bg-navy-950 py-14">
        <Container className="text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{t('es', 'aboutCtaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-grey-100/90">{t('es', 'aboutCtaDescription')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="/es/contact" variant="primary">
              {t('es', 'aboutCtaPrimaryButton')}
            </Button>
            <Button href="/es/products" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-navy-950">
              {t('es', 'aboutCtaSecondaryButton')}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
