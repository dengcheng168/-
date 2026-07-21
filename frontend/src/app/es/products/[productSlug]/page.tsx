import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductSpecTable } from '@/components/product/ProductSpecTable';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { getProductBySlug } from '@/lib/api/products';
import { getPublicSettings } from '@/lib/api/settings';
import { productJsonLd, breadcrumbListJsonLd } from '@/lib/seo/jsonld';
import { getWhatsappHref } from '@/lib/utils/whatsapp';
import { t } from '@/lib/i18n/site-strings';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
  const { productSlug } = await params;
  const result = await getProductBySlug(productSlug, 'es');
  if (!result) return {};

  const { product } = result;
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    keywords: product.seoKeywords ?? undefined,
    alternates: {
      canonical: `/es/products/${productSlug}`,
      languages: { en: `/products/${productSlug}`, es: `/es/products/${productSlug}` },
    },
    openGraph: {
      images: product.ogImage ? [product.ogImage] : [product.mainImage],
    },
  };
}

export default async function SpanishProductDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const [result, settings] = await Promise.all([getProductBySlug(productSlug, 'es'), getPublicSettings()]);

  if (!result) notFound();
  const { product, related } = result;

  const whatsappHref = getWhatsappHref(settings);

  return (
    <Container className="py-12">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbListJsonLd([
          { label: t('es', 'breadcrumbHome'), href: '/es' },
          { label: t('es', 'breadcrumbProducts'), href: '/es/products' },
          { label: product.name, href: `/es/products/${product.slug}` },
        ])}
      />

      <Breadcrumbs
        items={[
          { label: t('es', 'breadcrumbHome'), href: '/es' },
          { label: t('es', 'breadcrumbProducts'), href: '/es/products' },
          ...(product.category
            ? [{ label: product.category.name, href: `/es/products/category/${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery mainImage={product.mainImage} images={product.galleryImages} name={product.name} />

        <div>
          <h1 className="text-3xl font-semibold text-navy-950">{product.name}</h1>
          {product.sku && <p className="mt-1 text-sm text-grey-500">{t('es', 'skuLabel')}: {product.sku}</p>}
          {product.shortDescription && <p className="mt-4 text-grey-700">{product.shortDescription}</p>}

          <dl className="mt-6 space-y-2 text-sm">
            {product.moq && (
              <div className="flex gap-2">
                <dt className="font-medium text-grey-700">{t('es', 'moqLabel')}:</dt>
                <dd className="text-navy-950">{product.moq}</dd>
              </div>
            )}
            {product.packagingInfo && (
              <div className="flex gap-2">
                <dt className="font-medium text-grey-700">{t('es', 'packagingLabel')}:</dt>
                <dd className="text-navy-950">{product.packagingInfo}</dd>
              </div>
            )}
            {product.oemOdmSupport && (
              <div className="flex gap-2">
                <dt className="font-medium text-grey-700">{t('es', 'oemOdmLabel')}:</dt>
                <dd className="text-navy-950">{t('es', 'oemOdmSupported')}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="#inquiry" variant="primary">
              {t('es', 'headerCta')}
            </Button>
            {whatsappHref && (
              <Button href={whatsappHref} target="_blank" variant="secondary">
                {t('es', 'contactViaWhatsapp')}
              </Button>
            )}
            {product.specSheetUrl && (
              <Button href={product.specSheetUrl} target="_blank" variant="outline">
                {t('es', 'downloadSpecSheet')}
              </Button>
            )}
          </div>

          {product.specs.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-3 text-lg font-semibold text-navy-950">{t('es', 'specifications')}</h2>
              <ProductSpecTable specs={product.specs} />
            </div>
          )}
        </div>
      </div>

      {product.features.length > 0 && (
        <section className="mt-16">
          <SectionHeading title={t('es', 'productFeatures')} align="left" />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {product.features.map((feature, i) => {
              const label = typeof feature === 'string' ? feature : feature.title;
              const description = typeof feature === 'string' ? undefined : feature.description;
              return (
                <li key={`${label}-${i}`} className="rounded-md border border-grey-200 bg-white p-4">
                  <p className="font-medium text-navy-950">{label}</p>
                  {description && <p className="mt-1 text-sm text-grey-500">{description}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {product.applications.length > 0 && (
        <section className="mt-16">
          <SectionHeading title={t('es', 'applicationScenarios')} align="left" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.applications.map((app) => (
              <div key={app.title} className="rounded-lg border border-grey-200 bg-white p-5">
                <h3 className="font-semibold text-navy-950">{app.title}</h3>
                {app.description && <p className="mt-2 text-sm text-grey-500">{app.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16">
        <SectionHeading title={t('es', 'productDescription')} align="left" />
        <div
          className="prose prose-sm mt-6 max-w-none text-grey-700"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </section>

      <RelatedProducts products={related} locale="es" />

      <section id="inquiry" className="mt-16 scroll-mt-24">
        <SectionHeading title={t('es', 'sectionInquiryTitle')} align="left" />
        <div className="mt-6 max-w-2xl">
          <InquiryForm sourcePage={`/es/products/${product.slug}`} defaultProductName={product.name} locale="es" />
        </div>
      </section>
    </Container>
  );
}
