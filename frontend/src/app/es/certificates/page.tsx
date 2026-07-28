import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { listCertificates, getPageBySlug } from '@/lib/api/content';
import { t } from '@/lib/i18n/site-strings';

export const metadata: Metadata = {
  title: t('es', 'certificatesPageTitle'),
  description: t('es', 'certificatesPageDescription'),
  alternates: {
    canonical: '/es/certificates',
    languages: { en: '/certificates', es: '/es/certificates', 'x-default': '/certificates' },
  },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function SpanishCertificatesPage() {
  const [certificates, page] = await Promise.all([listCertificates('es'), getPageBySlug('certificates', 'es')]);
  const hasHero = Boolean(page?.heroImage || page?.heroImageMobile);

  return (
    <>
      {hasHero && (
        <PageHeroBanner image={page?.heroImage} imageMobile={page?.heroImageMobile} title={t('es', 'certificatesPageTitle')}>
          <p className="mt-3 max-w-2xl text-grey-100/90">{t('es', 'certificatesIntro')}</p>
        </PageHeroBanner>
      )}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: t('es', 'breadcrumbHome'), href: '/es' }, { label: t('es', 'breadcrumbCertificates') }]} locale="es" />
        {!hasHero && (
          <>
            <h1 className="mt-4 text-3xl font-semibold text-navy-950">{t('es', 'certificatesPageTitle')}</h1>
            <p className="mt-3 max-w-2xl text-grey-500">{t('es', 'certificatesIntro')}</p>
          </>
        )}

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
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col items-center p-4">
                {cert.issuingAuthority && (
                  <span className="text-xs font-medium uppercase tracking-wide text-water-600">{cert.issuingAuthority}</span>
                )}
                <h3 className="mt-1 text-base font-semibold text-navy-950">{cert.name}</h3>
                {cert.certNumber && (
                  <p className="mt-1 text-xs text-grey-500">
                    {t('es', 'certNumberPrefix')} {cert.certNumber}
                  </p>
                )}
                {formatDate(cert.issueDate) && (
                  <p className="mt-1 text-xs text-grey-500">
                    {t('es', 'issuedLabel')} {formatDate(cert.issueDate)}
                  </p>
                )}
                {cert.description && <p className="mt-2 line-clamp-2 text-sm text-grey-500">{cert.description}</p>}
                {cert.pdfUrl && (
                  <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-3 text-sm font-medium text-water-600 hover:underline">
                    {t('es', 'viewPdf')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
