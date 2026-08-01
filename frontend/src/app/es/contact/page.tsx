import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { getPageBySlug } from '@/lib/api/content';
import { getPublicSettings } from '@/lib/api/settings';
import { t } from '@/lib/i18n/site-strings';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('contact', 'es');
  return {
    title: page?.seoTitle ?? page?.title ?? t('es', 'contactPageTitle'),
    description: page?.seoDescription ?? undefined,
    alternates: {
      canonical: '/es/contact',
      languages: { en: '/contact', es: '/es/contact', 'x-default': '/contact' },
    },
  };
}

export default async function SpanishContactPage() {
  const [page, settings] = await Promise.all([getPageBySlug('contact', 'es'), getPublicSettings()]);
  const hasHero = Boolean(page?.heroImage || page?.heroImageMobile);

  return (
    <>
      {hasHero && (
        <PageHeroBanner image={page?.heroImage} imageMobile={page?.heroImageMobile} title={page?.title ?? t('es', 'contactPageTitle')}>
          {page?.bodyHtml && (
            <div
              className="prose prose-sm prose-invert mt-4 max-w-2xl text-grey-100/90"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
          )}
        </PageHeroBanner>
      )}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: t('es', 'breadcrumbHome'), href: '/es' }, { label: t('es', 'breadcrumbContact') }]} locale="es" />
        {!hasHero && (
          <>
            <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? t('es', 'contactPageTitle')}</h1>
            {page?.bodyHtml && (
              <div
                className="prose prose-sm mt-4 max-w-2xl text-grey-700"
                dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
              />
            )}
          </>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-4 text-sm">
            {settings.companyEmail && (
              <div>
                <div className="font-semibold text-navy-950">{t('es', 'emailLabel')}</div>
                <a href={`mailto:${settings.companyEmail}`} className="mt-1 block text-water-600 hover:underline">
                  {settings.companyEmail}
                </a>
              </div>
            )}
            {settings.companyPhone && (
              <div>
                <div className="font-semibold text-navy-950">{t('es', 'phoneLabel')}</div>
                <div className="mt-1 text-grey-500">{settings.companyPhone}</div>
              </div>
            )}
            {settings.whatsappNumber && (
              <div>
                <div className="font-semibold text-navy-950">{t('es', 'whatsappLabel')}</div>
                <div className="mt-1 text-grey-500">{settings.whatsappNumber}</div>
              </div>
            )}
          </div>

          <div>
            <InquiryForm sourcePage="/es/contact" locale="es" />
          </div>
        </div>

        {settings.companyAddress && (
          <div className="mt-10 border-t border-grey-200 pt-6 text-sm">
            <div className="font-semibold text-navy-950">{t('es', 'addressLabel')}</div>
            <div className="mt-1 text-grey-500">{settings.companyAddress}</div>
            <div className="relative mt-3 h-[350px] w-full overflow-hidden rounded-lg bg-grey-100 sm:h-[450px]">
              {settings.companyMapImage && (
                <Image
                  src={settings.companyMapImage}
                  alt="Mapa de ubicación de la fábrica"
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.companyAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-navy-950 shadow hover:bg-grey-50"
              >
                {t('es', 'openInMapsLabel')}
              </a>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
