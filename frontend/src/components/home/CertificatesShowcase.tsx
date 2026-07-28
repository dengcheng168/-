import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';
import type { Certificate } from '@/types/content';

export function CertificatesShowcase({ certificates, locale = 'en' }: { certificates: Certificate[]; locale?: Locale }) {
  if (certificates.length === 0) return null;

  return (
    <section className="bg-grey-50 py-16">
      <Container>
        <SectionHeading eyebrow={t(locale, 'sectionCertificatesEyebrow')} title={t(locale, 'sectionCertificatesTitle')} />
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="group flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-grey-200 bg-white text-center transition-shadow hover:shadow-lg sm:w-72"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-grey-50">
                <Image
                  src={cert.imageUrl}
                  alt={cert.name}
                  fill
                  sizes="288px"
                  className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col items-center p-4">
                {cert.issuingAuthority && (
                  <span className="text-xs font-medium uppercase tracking-wide text-water-600">{cert.issuingAuthority}</span>
                )}
                <h3 className="mt-1 text-base font-semibold text-navy-950">{cert.name}</h3>
                {cert.description && <p className="mt-2 line-clamp-2 text-sm text-grey-500">{cert.description}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href={localeHref('/certificates', locale)} variant="outline">
            {t(locale, 'viewAllCertificates')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
