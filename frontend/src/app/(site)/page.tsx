import type { Metadata } from 'next';
import { getPublicSettings } from '@/lib/api/settings';
import { listProductCategories, listProducts } from '@/lib/api/products';
import { listCertificates, listFaqs } from '@/lib/api/content';
import { listBlogPosts } from '@/lib/api/blog';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { getSiteUrl } from '@/lib/seo/site';
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
    // title/description 显式设为 undefined 也会被 Next.js 当作"本段落定义了该字段"，
    // 从而盖掉根 layout 的 title.default 变成空标题，所以未配置时要整个 key 都不传
    ...(settings.defaultSeoTitle ? { title: settings.defaultSeoTitle } : {}),
    ...(settings.defaultSeoDescription ? { description: settings.defaultSeoDescription } : {}),
    alternates: { canonical: '/', languages: { en: '/', es: '/es', 'x-default': '/' } },
  };
}

export default async function HomePage() {
  const [settings, categories, featuredProducts, certificates, latestPosts, faqs, siteUrl] =
    await Promise.all([
      getPublicSettings(),
      listProductCategories(),
      listProducts({ featured: true, pageSize: 8 }),
      listCertificates(),
      listBlogPosts({ pageSize: 3 }),
      listFaqs(),
      getSiteUrl(),
    ]);

  return (
    <>
      <JsonLd data={organizationJsonLd(settings, siteUrl)} />
      <JsonLd data={websiteJsonLd(settings, siteUrl)} />

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
