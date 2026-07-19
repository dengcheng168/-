import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function OemProcess({ steps }: { steps: string[] }) {
  if (steps.length === 0) return null;

  return (
    <section className="bg-navy-950 py-16 text-white">
      <Container>
        <SectionHeading eyebrow="OEM / ODM" title="Our Service Process" />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-4 rounded-lg border border-white/10 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-water-500 text-sm font-semibold">
                {i + 1}
              </span>
              <span className="pt-1.5 text-sm font-medium">{step}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
