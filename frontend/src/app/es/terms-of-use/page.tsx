import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getPageBySlug } from '@/lib/api/content';
import { t } from '@/lib/i18n/site-strings';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('terms-of-use', 'es');
  return {
    title: page?.seoTitle ?? page?.title ?? t('es', 'termsOfUsePageTitle'),
    description: page?.seoDescription ?? undefined,
    alternates: { canonical: '/es/terms-of-use', languages: { en: '/terms-of-use', es: '/es/terms-of-use' } },
  };
}

export default async function SpanishTermsOfUsePage() {
  const page = await getPageBySlug('terms-of-use', 'es');

  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: t('es', 'breadcrumbHome'), href: '/es' }, { label: t('es', 'breadcrumbTermsOfUse') }]} />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? t('es', 'termsOfUsePageTitle')}</h1>
      {page?.bodyHtml && (
        <div
          className="prose prose-sm mt-6 max-w-3xl text-grey-700"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      )}
    </Container>
  );
}
