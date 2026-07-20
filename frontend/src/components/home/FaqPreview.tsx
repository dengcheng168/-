import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import type { Faq } from '@/types/content';

export function FaqPreview({ faqs, locale = 'en' }: { faqs: Faq[]; locale?: Locale }) {
  if (faqs.length === 0) return null;
  const preview = faqs.slice(0, 5);
  const faqHref = locale === 'en' ? '/faq' : `/${locale}/faq`;

  return (
    <section className="bg-grey-50 py-16">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow={t(locale, 'sectionFaqEyebrow')} title={t(locale, 'sectionFaqTitle')} />
        <div className="mt-10">
          <FaqAccordion faqs={preview} />
        </div>
        <div className="mt-8 text-center">
          <Button href={faqHref} variant="outline">
            {t(locale, 'viewAllFaqs')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
