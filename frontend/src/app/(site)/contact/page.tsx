import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { getPageBySlug } from '@/lib/api/content';
import { getPublicSettings } from '@/lib/api/settings';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('contact');
  return {
    title: page?.seoTitle ?? page?.title ?? 'Contact Us',
    description: page?.seoDescription ?? undefined,
    alternates: { canonical: '/contact', languages: { en: '/contact', es: '/es/contact', 'x-default': '/contact' } },
  };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPageBySlug('contact'), getPublicSettings()]);
  const hasHero = Boolean(page?.heroImage || page?.heroImageMobile);

  return (
    <>
      {hasHero && (
        <PageHeroBanner image={page?.heroImage} imageMobile={page?.heroImageMobile} title={page?.title ?? 'Contact Us'}>
          {page?.bodyHtml && (
            <div
              className="prose prose-sm prose-invert mt-4 max-w-2xl text-grey-100/90"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
          )}
          <a
            href="#inquiry-form"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-water-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-water-600"
          >
            Get a Free Quote
          </a>
        </PageHeroBanner>
      )}

      <Container className="py-8 sm:py-12">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
        {!hasHero && (
          <>
            <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? 'Contact Us'}</h1>
            {page?.bodyHtml && (
              <div
                className="prose prose-sm mt-4 max-w-2xl text-grey-700"
                dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
              />
            )}
          </>
        )}

        <div className="mt-6 grid gap-8 sm:mt-10 lg:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.45fr)] lg:items-start lg:gap-12">
          <aside className="order-2 space-y-5 text-sm lg:order-1 lg:sticky lg:top-24 lg:rounded-2xl lg:bg-navy-950 lg:p-8 lg:text-white lg:shadow-xl lg:shadow-navy-950/10">
            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-water-300">Contact Li-Men</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-white">Let&apos;s build your water purification project</h2>
              <p className="mt-3 leading-6 text-grey-200">Speak directly with our OEM/ODM team about products, customization and quotations.</p>
            </div>
            {settings.companyEmail && (
              <div className="lg:border-t lg:border-white/15 lg:pt-5">
                <div className="font-semibold text-navy-950 lg:text-white">Email</div>
                <a href={`mailto:${settings.companyEmail}`} className="mt-1 block text-water-600 hover:underline lg:text-water-200">
                  {settings.companyEmail}
                </a>
              </div>
            )}
            {settings.companyPhone && (
              <div>
                <div className="font-semibold text-navy-950 lg:text-white">Phone</div>
                <div className="mt-1 text-grey-500 lg:text-grey-200">{settings.companyPhone}</div>
              </div>
            )}
            {settings.whatsappNumber && (
              <div>
                <div className="font-semibold text-navy-950 lg:text-white">WhatsApp</div>
                <div className="mt-1 text-grey-500 lg:text-grey-200">{settings.whatsappNumber}</div>
              </div>
            )}
            <div className="hidden rounded-xl bg-white/10 p-4 leading-6 text-grey-100 lg:block">
              <span className="font-semibold text-white">Fast response.</span> We normally reply within one business day.
            </div>
          </aside>

          <div
            id="inquiry-form"
            className="order-1 scroll-mt-24 rounded-2xl border border-grey-200 bg-white p-5 shadow-lg shadow-navy-950/5 sm:p-8 lg:order-2 lg:p-10"
          >
            <div className="mb-6 border-b border-grey-200 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-water-600">Free project assessment</p>
              <h2 className="mt-2 text-2xl font-semibold text-navy-950">Start Your OEM/ODM Project</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-grey-500">
                Tell us what you need. Our water purification team will review your requirements and reply within one business day.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-navy-950">
                <span className="rounded-full bg-water-100 px-3 py-1.5">24-hour response</span>
                <span className="rounded-full bg-water-100 px-3 py-1.5">OEM &amp; ODM support</span>
                <span className="rounded-full bg-water-100 px-3 py-1.5">No-obligation quote</span>
              </div>
            </div>
            <InquiryForm sourcePage="/contact" turnstileEnabled={settings.turnstileEnabled} turnstileSiteKey={settings.turnstileSiteKey} />
          </div>
        </div>

        {settings.companyAddress && (
          <div className="mt-10 border-t border-grey-200 pt-6 text-sm">
            <div className="font-semibold text-navy-950">Address</div>
            <div className="mt-1 text-grey-500">{settings.companyAddress}</div>
            <div
              className={`relative mt-3 w-full overflow-hidden rounded-lg bg-grey-100 ${
                settings.companyMapMobileImage
                  ? 'aspect-[5/6] sm:aspect-auto sm:h-[450px]'
                  : 'h-[350px] sm:h-[450px]'
              }`}
            >
              {(settings.companyMapMobileImage || settings.companyMapImage) && (
                <Image
                  src={settings.companyMapMobileImage || settings.companyMapImage!}
                  alt="Factory address map"
                  fill
                  sizes="100vw"
                  className="object-contain sm:hidden"
                />
              )}
              {settings.companyMapImage && (
                <Image
                  src={settings.companyMapImage}
                  alt="Factory address map"
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="hidden object-cover sm:block"
                />
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.companyAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-navy-950 shadow hover:bg-grey-50"
              >
                Open in Maps ↗
              </a>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
