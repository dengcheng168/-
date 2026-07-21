import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';

export function InquirySection({ locale = 'en' }: { locale?: Locale } = {}) {
  return (
    <section className="py-16">
      <Container className="max-w-2xl">
        <SectionHeading eyebrow={t(locale, 'sectionInquiryEyebrow')} title={t(locale, 'sectionInquiryTitle')} />
        <div className="mt-10">
          <InquiryForm sourcePage={localeHref('/', locale)} locale={locale} />
        </div>
      </Container>
    </section>
  );
}
