import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import type { Certificate } from '@/types/content';

export function CertificatesShowcase({ certificates, locale = 'en' }: { certificates: Certificate[]; locale?: Locale }) {
  if (certificates.length === 0) return null;

  return (
    <section className="bg-grey-50 py-16">
      <Container>
        <SectionHeading eyebrow={t(locale, 'sectionCertificatesEyebrow')} title={t(locale, 'sectionCertificatesTitle')} />
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="flex flex-col items-center rounded-lg border border-grey-200 bg-white p-4 text-center">
              <div className="relative h-24 w-24">
                <Image src={cert.imageUrl} alt={cert.name} fill sizes="96px" className="object-contain" />
              </div>
              <p className="mt-3 text-sm font-medium text-navy-950">{cert.name}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href="/certificates" variant="outline">
            {t(locale, 'viewAllCertificates')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
