import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { CoreAdvantage } from '@/types/settings';

export function CoreAdvantages({ items }: { items: CoreAdvantage[] }) {
  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Why Choose Us" title="Core Advantages" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="animate-fade-up rounded-lg border border-grey-200 bg-white p-6"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <h3 className="text-lg font-semibold text-navy-950">{item.title}</h3>
              {item.description && <p className="mt-2 text-sm text-grey-500">{item.description}</p>}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
