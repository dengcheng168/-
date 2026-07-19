import type { Metadata } from 'next';
import { getPublicSettings } from '@/lib/api/settings';
import { listProductCategories, listProducts } from '@/lib/api/products';
import { listCertificates, listFaqs } from '@/lib/api/content';
import { listBlogPosts } from '@/lib/api/blog';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CoreAdvantages } from '@/components/home/CoreAdvantages';
import { ProductCategories } from '@/components/home/ProductCategories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CertificatesShowcase } from '@/components/home/CertificatesShowcase';
import { LatestBlogPosts } from '@/components/home/LatestBlogPosts';
import { FaqPreview } from '@/components/home/FaqPreview';
import { InquirySection } from '@/components/home/InquirySection';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    title: settings.defaultSeoTitle ?? undefined,
    description: settings.defaultSeoDescription ?? undefined,
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  const [settings, categories, featuredProducts, certificates, latestPosts, faqs] =
    await Promise.all([
      getPublicSettings(),
      listProductCategories(),
      listProducts({ featured: true, pageSize: 8 }),
      listCertificates(),
      listBlogPosts({ pageSize: 3 }),
      listFaqs(),
    ]);

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <JsonLd data={websiteJsonLd(settings)} />

      <HeroBanner settings={settings} />
      <CoreAdvantages items={settings.coreAdvantages} />
      <ProductCategories categories={categories} />
      <FeaturedProducts products={featuredProducts.items} />
      <CertificatesShowcase certificates={certificates} />
      <LatestBlogPosts posts={latestPosts.items} />
      <FaqPreview faqs={faqs} />
      <InquirySection />
    </>
  );
}
