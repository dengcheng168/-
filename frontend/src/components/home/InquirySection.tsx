import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { InquiryForm } from '@/components/forms/InquiryForm';

export function InquirySection() {
  return (
    <section className="py-16">
      <Container className="max-w-2xl">
        <SectionHeading eyebrow="Get in Touch" title="Request a Quote" />
        <div className="mt-10">
          <InquiryForm sourcePage="/" />
        </div>
      </Container>
    </section>
  );
}
