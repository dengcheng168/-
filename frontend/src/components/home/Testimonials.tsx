import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Testimonial } from '@/types/content';

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-grey-50 py-16">
      <Container>
        <SectionHeading eyebrow="Client Feedback" title="What Our Customers Say" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="rounded-lg border border-grey-200 bg-white p-6">
              <p className="text-sm text-grey-700">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm">
                <span className="font-semibold text-navy-950">{t.authorName}</span>
                {t.companyName && <span className="text-grey-500"> · {t.companyName}</span>}
                {t.country && <span className="text-grey-500"> · {t.country}</span>}
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </section>
  );
}
