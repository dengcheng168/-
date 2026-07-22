import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getPageBySlug } from '@/lib/api/content';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('privacy-policy');
  return {
    title: page?.seoTitle ?? page?.title ?? 'Privacy Policy',
    description: page?.seoDescription ?? undefined,
    alternates: {
      canonical: '/privacy-policy',
      languages: { en: '/privacy-policy', es: '/es/privacy-policy', 'x-default': '/privacy-policy' },
    },
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getPageBySlug('privacy-policy');

  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? 'Privacy Policy'}</h1>
      {page?.bodyHtml && (
        <div
          className="prose prose-sm mt-6 max-w-3xl text-grey-700"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      )}
    </Container>
  );
}
