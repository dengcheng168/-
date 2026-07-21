import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { getPageBySlug } from '@/lib/api/content';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about');
  return {
    title: page?.seoTitle ?? page?.title ?? 'About Us',
    description: page?.seoDescription ?? undefined,
    alternates: { canonical: '/about' },
  };
}

export default async function AboutPage() {
  const page = await getPageBySlug('about');
  const hasHero = Boolean(page?.heroImage || page?.heroImageMobile);

  return (
    <>
      {hasHero && (
        <PageHeroBanner image={page?.heroImage} imageMobile={page?.heroImageMobile} title={page?.title ?? 'About Us'}>
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
      </Container>
    </>
  );
}
