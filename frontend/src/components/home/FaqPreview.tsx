import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { Button } from '@/components/ui/Button';
import type { Faq } from '@/types/content';

export function FaqPreview({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;
  const preview = faqs.slice(0, 5);

  return (
    <section className="bg-grey-50 py-16">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Got Questions?" title="Frequently Asked Questions" />
        <div className="mt-10">
          <FaqAccordion faqs={preview} />
        </div>
        <div className="mt-8 text-center">
          <Button href="/faq" variant="outline">
            View All FAQs
          </Button>
        </div>
      </Container>
    </section>
  );
}
