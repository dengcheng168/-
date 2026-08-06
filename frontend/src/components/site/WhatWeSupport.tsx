import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';

export function WhatWeSupport({ locale = 'en' }: { locale?: Locale }) {
  const items = [
    { title: t(locale, 'whatWeSupportItem1Title'), description: t(locale, 'whatWeSupportItem1Desc') },
    { title: t(locale, 'whatWeSupportItem2Title'), description: t(locale, 'whatWeSupportItem2Desc') },
    { title: t(locale, 'whatWeSupportItem3Title'), description: t(locale, 'whatWeSupportItem3Desc') },
  ];

  return (
    <section className="py-4">
      <Container>
        <SectionHeading title={t(locale, 'whatWeSupportTitle')} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="rounded-lg border border-grey-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-navy-950">{item.title}</h3>
              <p className="mt-2 text-sm text-grey-500">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
