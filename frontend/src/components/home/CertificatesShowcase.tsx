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
        {/* 首页只是精选预览（配一个"查看全部"按钮跳去 /certificates 看完整列表），
            所以不管有几张证书都强制挤在一行：不用 flex-wrap，让卡片按需整体等比收缩，
            证书少的时候每张卡片保持自然宽度、作为一组整体居中；证书变多时才会一起变窄，
            但永远不会换到第二行。完整列表页 /certificates 是另一套会换行的布局，不受影响。 */}
        <div className="mt-10 flex flex-nowrap justify-center gap-4 overflow-x-auto">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="group flex w-56 shrink flex-col overflow-hidden rounded-lg border border-grey-200 bg-white text-center transition-shadow hover:shadow-lg"
            >
              <div className="overflow-hidden bg-grey-50">
                <Image
                  src={cert.imageUrl}
                  alt={cert.name}
                  width={0}
                  height={0}
                  sizes="224px"
                  className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
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
