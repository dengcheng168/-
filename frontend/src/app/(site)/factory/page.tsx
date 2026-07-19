import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getPageBySlug } from '@/lib/api/content';
import { getPublicSettings } from '@/lib/api/settings';

interface FactorySections {
  factoryArea?: string;
  employeeCount?: string;
  productionLines?: string;
  annualCapacity?: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('factory');
  return {
    title: page?.seoTitle ?? page?.title ?? 'Factory Strength',
    description: page?.seoDescription ?? undefined,
    alternates: { canonical: '/factory' },
  };
}

export default async function FactoryPage() {
  const [page, settings] = await Promise.all([getPageBySlug('factory'), getPublicSettings()]);
  const sections = (page?.sections ?? {}) as FactorySections;

  const stats = [
    { label: 'Factory Area', value: sections.factoryArea },
    { label: 'Employees', value: sections.employeeCount },
    { label: 'Production Lines', value: sections.productionLines },
    { label: 'Annual Capacity', value: sections.annualCapacity },
  ].filter((s): s is { label: string; value: string } => !!s.value);

  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Factory' }]} />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? 'Factory Strength'}</h1>

      {page?.bodyHtml && (
        <div
          className="prose prose-sm mt-6 max-w-none text-grey-700"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      )}

      {stats.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-grey-200 bg-white p-5 text-center">
              <div className="text-xl font-bold text-navy-950">{stat.value}</div>
              <div className="mt-1 text-sm text-grey-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {settings.factoryPhotos.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Production Facilities" align="left" />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {settings.factoryPhotos.map((photo) => (
              <div key={photo} className="relative aspect-square overflow-hidden rounded-lg bg-grey-100">
                <Image src={photo} alt="Factory facility" fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
