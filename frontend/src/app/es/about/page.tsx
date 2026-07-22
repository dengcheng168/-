import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { getPageBySlug } from '@/lib/api/content';
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
  const page = await getPageBySlug('about', 'es');
  const hasHero = Boolean(page?.heroImage || page?.heroImageMobile);

  return (
    <>
      {hasHero && (
        <PageHeroBanner image={page?.heroImage} imageMobile={page?.heroImageMobile} title={page?.title ?? t('es', 'aboutPageTitle')}>
          {page?.bodyHtml && (
            <div
              className="prose prose-sm prose-invert mt-4 max-w-3xl text-grey-100/90"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
          )}
        </PageHeroBanner>
      )}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: t('es', 'breadcrumbHome'), href: '/es' }, { label: t('es', 'breadcrumbAbout') }]} />
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
      </Container>
    </>
  );
}
