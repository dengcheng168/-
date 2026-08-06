import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';
import type { Certificate } from '@/types/content';
import { getCertificateDisplayMeta, localizeCertMeta } from '@/lib/certificates/display-config';

export function CertificatesShowcase({ certificates, locale = 'en' }: { certificates: Certificate[]; locale?: Locale }) {
  // 首页预览只展示已核实分类、且不是 Historical/Expired 的证书，避免暗示所有文件都适用于当前产品
  const eligible = certificates.filter((c) => getCertificateDisplayMeta(c.id)?.group !== 'historical' && getCertificateDisplayMeta(c.id));
  if (eligible.length === 0) return null;
  const displayedCertificates = eligible.slice(0, 4);

  return (
    <section className="bg-grey-50 py-16">
      <Container>
        <SectionHeading eyebrow={t(locale, 'sectionCertificatesEyebrow')} title={t(locale, 'sectionCertificatesTitle')} />
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {displayedCertificates.map((cert) => {
            const rawMeta = getCertificateDisplayMeta(cert.id);
            const meta = rawMeta ? localizeCertMeta(rawMeta, locale) : null;
            return (
              <div
                key={cert.id}
                className="group flex w-[calc(50%-0.75rem)] flex-col overflow-hidden rounded-lg border border-grey-200 bg-white text-center transition-shadow hover:shadow-lg sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)]"
              >
                <div className="overflow-hidden bg-grey-50">
                  <Image
                    src={cert.imageUrl}
                    alt={cert.name}
                    width={0}
                    height={0}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col items-center p-4">
                  {cert.issuingAuthority && (
                    <span className="block w-full truncate text-xs font-medium uppercase tracking-wide text-water-600">{cert.issuingAuthority}</span>
                  )}
                  <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-navy-950">{cert.name}</h3>
                  {meta && <p className="mt-1 text-xs font-medium text-grey-500">{meta.productType}</p>}
                </div>
              </div>
            );
          })}
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
