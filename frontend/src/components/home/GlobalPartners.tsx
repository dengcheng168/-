import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function GlobalPartners({ regions }: { regions: string[] }) {
  if (regions.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Global Reach" title="Partnership Regions" />
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {regions.map((region) => (
            <span
              key={region}
              className="rounded-full border border-grey-200 bg-white px-5 py-2 text-sm font-medium text-navy-900"
            >
              {region}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
