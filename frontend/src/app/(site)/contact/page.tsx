import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { getPageBySlug } from '@/lib/api/content';
import { getPublicSettings } from '@/lib/api/settings';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('contact');
  return {
    title: page?.seoTitle ?? page?.title ?? 'Contact Us',
    description: page?.seoDescription ?? undefined,
    alternates: { canonical: '/contact' },
  };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPageBySlug('contact'), getPublicSettings()]);

  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">{page?.title ?? 'Contact Us'}</h1>
      {page?.bodyHtml && (
        <div
          className="prose prose-sm mt-4 max-w-2xl text-grey-700"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4 text-sm">
          {settings.companyAddress && (
            <div>
              <div className="font-semibold text-navy-950">Address</div>
              <div className="mt-1 text-grey-500">{settings.companyAddress}</div>
            </div>
          )}
          {settings.companyEmail && (
            <div>
              <div className="font-semibold text-navy-950">Email</div>
              <a href={`mailto:${settings.companyEmail}`} className="mt-1 block text-water-600 hover:underline">
                {settings.companyEmail}
              </a>
            </div>
          )}
          {settings.companyPhone && (
            <div>
              <div className="font-semibold text-navy-950">Phone</div>
              <div className="mt-1 text-grey-500">{settings.companyPhone}</div>
            </div>
          )}
          {settings.whatsappNumber && (
            <div>
              <div className="font-semibold text-navy-950">WhatsApp</div>
              <div className="mt-1 text-grey-500">{settings.whatsappNumber}</div>
            </div>
          )}
        </div>

        <div>
          <InquiryForm sourcePage="/contact" />
        </div>
      </div>
    </Container>
  );
}
