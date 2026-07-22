import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { JsonLd } from '@/components/seo/JsonLd';
import { listFaqs } from '@/lib/api/content';
import { faqPageJsonLd } from '@/lib/seo/jsonld';
import { t } from '@/lib/i18n/site-strings';

export const metadata: Metadata = {
  title: t('es', 'faqPageTitle'),
  description: t('es', 'faqPageDescription'),
  alternates: { canonical: '/es/faq', languages: { en: '/faq', es: '/es/faq', 'x-default': '/faq' } },
};

export default async function SpanishFaqPage() {
  const faqs = await listFaqs('es');

  return (
    <Container className="py-12">
      <JsonLd data={faqPageJsonLd(faqs, 'es')} />
      <Breadcrumbs items={[{ label: t('es', 'breadcrumbHome'), href: '/es' }, { label: t('es', 'faqBreadcrumb') }]} />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">{t('es', 'faqPageTitle')}</h1>

      <div className="mt-10 max-w-3xl">
        <FaqAccordion faqs={faqs} />
      </div>
    </Container>
  );
}
