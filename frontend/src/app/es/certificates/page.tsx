import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { CertificateCard } from '@/components/site/CertificateCard';
import { listCertificates, getPageBySlug } from '@/lib/api/content';
import { t } from '@/lib/i18n/site-strings';
import { getCertificateDisplayMeta } from '@/lib/certificates/display-config';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('certificates', 'es');
  return {
    title: page?.seoTitle ?? page?.title ?? t('es', 'certificatesPageTitle'),
    description: page?.seoDescription ?? t('es', 'certificatesPageDescription'),
    alternates: {
      canonical: '/es/certificates',
      languages: { en: '/certificates', es: '/es/certificates', 'x-default': '/certificates' },
    },
  };
}

export default async function SpanishCertificatesPage() {
  const [allCertificates, page] = await Promise.all([listCertificates('es'), getPageBySlug('certificates', 'es')]);
  const hasHero = Boolean(page?.heroImage || page?.heroImageMobile);

  const certificates = allCertificates.filter((c) => getCertificateDisplayMeta(c.id));
  const approvals = certificates.filter((c) => getCertificateDisplayMeta(c.id)?.group === 'approvals');
  const compliance = certificates.filter((c) => getCertificateDisplayMeta(c.id)?.group === 'compliance');
  const historical = certificates.filter((c) => getCertificateDisplayMeta(c.id)?.group === 'historical');

  return (
    <>
      {hasHero && (
        <PageHeroBanner
          image={page?.heroImage}
          imageMobile={page?.heroImageMobile}
          eyebrow={t('es', 'certPageEyebrow')}
          title={page?.title ?? t('es', 'certificatesPageTitle')}
        >
          {page?.bodyHtml ? (
            <div
              className="prose prose-sm prose-invert mt-4 max-w-2xl text-grey-100/90"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
          ) : (
            <p className="mt-3 max-w-2xl text-grey-100/90">{t('es', 'certificatesIntro')}</p>
          )}
        </PageHeroBanner>
      )}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: t('es', 'breadcrumbHome'), href: '/es' }, { label: t('es', 'breadcrumbCertificates') }]} locale="es" />
        {!hasHero && (
          <>
            <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? t('es', 'certificatesPageTitle')}</h1>
            {page?.bodyHtml ? (
              <div
                className="prose prose-sm mt-4 max-w-2xl text-grey-500"
                dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
              />
            ) : (
              <p className="mt-3 max-w-2xl text-grey-500">{t('es', 'certificatesIntro')}</p>
            )}
          </>
        )}

        <div className="mt-8 rounded-lg border border-water-100 bg-water-50 p-4 text-sm text-navy-950">
          {t('es', 'certScopeNotice')}
        </div>

        {approvals.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-navy-950">{t('es', 'certGroupApprovalsTitle')}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {approvals.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} locale="es" />
              ))}
            </div>
          </section>
        )}

        {compliance.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-navy-950">{t('es', 'certGroupComplianceTitle')}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {compliance.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} locale="es" />
              ))}
            </div>
          </section>
        )}

        {historical.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-grey-500">{t('es', 'certGroupHistoricalTitle')}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {historical.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} locale="es" muted />
              ))}
            </div>
          </section>
        )}
      </Container>

      <section className="bg-navy-950 py-14">
        <Container className="text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{t('es', 'certCtaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-grey-100/90">{t('es', 'certCtaDescription')}</p>
          <div className="mt-8">
            <Button href="/es/contact" variant="primary">
              {t('es', 'certCtaButton')}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
