import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { getPageBySlug } from '@/lib/api/content';

interface OemSections {
  processSteps?: string[];
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('oem-odm');
  return {
    title: page?.seoTitle ?? page?.title ?? 'OEM / ODM Services',
    description: page?.seoDescription ?? undefined,
    alternates: { canonical: '/oem-odm', languages: { en: '/oem-odm', es: '/es/oem-odm', 'x-default': '/oem-odm' } },
  };
}

export default async function OemOdmPage() {
  const page = await getPageBySlug('oem-odm');
  const sections = (page?.sections ?? {}) as OemSections;
  const steps = sections.processSteps ?? [];

  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'OEM / ODM' }]} />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? 'OEM / ODM Services'}</h1>

      {page?.bodyHtml && (
        <div
          className="prose prose-sm mt-6 max-w-none text-grey-700"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      )}

      {steps.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Our Service Process" align="left" />
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-4 rounded-lg border border-grey-200 bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-water-500 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <span className="pt-1.5 text-sm font-medium text-navy-950">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-16">
        <SectionHeading title="Get a Custom Quote" align="left" />
        <div className="mt-6 max-w-2xl">
          <InquiryForm sourcePage="/oem-odm" />
        </div>
      </section>
    </Container>
  );
}
