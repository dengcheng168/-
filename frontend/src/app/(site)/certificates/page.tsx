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
  const page = await getPageBySlug('certificates');
  return {
    title: page?.seoTitle ?? page?.title ?? 'Certificates',
    description: page?.seoDescription ?? 'Quality and compliance certificates for our water purifier products.',
    alternates: {
      canonical: '/certificates',
      languages: { en: '/certificates', es: '/es/certificates', 'x-default': '/certificates' },
    },
  };
}

export default async function CertificatesPage() {
  const [allCertificates, page] = await Promise.all([listCertificates(), getPageBySlug('certificates')]);
  const hasHero = Boolean(page?.heroImage || page?.heroImageMobile);

  // 只展示能在证书原文里核实分类/适用范围的证书，见 lib/certificates/display-config.ts
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
          eyebrow={t('en', 'certPageEyebrow')}
          title={page?.title ?? 'Certificates'}
        >
          {page?.bodyHtml && (
            <div
              className="prose prose-sm prose-invert mt-4 max-w-2xl text-grey-100/90"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
          )}
        </PageHeroBanner>
      )}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Certificates' }]} />
        {!hasHero && (
          <>
            <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? 'Certificates'}</h1>
            {page?.bodyHtml && (
              <div
                className="prose prose-sm mt-4 max-w-2xl text-grey-500"
                dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
              />
            )}
          </>
        )}

        <div className="mt-8 rounded-lg border border-water-100 bg-water-50 p-4 text-sm text-navy-950">
          {t('en', 'certScopeNotice')}
        </div>

        {approvals.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-navy-950">{t('en', 'certGroupApprovalsTitle')}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {approvals.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} locale="en" />
              ))}
            </div>
          </section>
        )}

        {compliance.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-navy-950">{t('en', 'certGroupComplianceTitle')}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {compliance.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} locale="en" />
              ))}
            </div>
          </section>
        )}

        {historical.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-grey-500">{t('en', 'certGroupHistoricalTitle')}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {historical.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} locale="en" muted />
              ))}
            </div>
          </section>
        )}
      </Container>

      <section className="bg-navy-950 py-14">
        <Container className="text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{t('en', 'certCtaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-grey-100/90">{t('en', 'certCtaDescription')}</p>
          <div className="mt-8">
            <Button href="/contact" variant="primary">
              {t('en', 'certCtaButton')}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
