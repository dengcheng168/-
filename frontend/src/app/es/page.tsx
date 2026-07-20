import type { Metadata } from 'next';
import { getPublicSettings } from '@/lib/api/settings';
import { listProductCategories, listProducts } from '@/lib/api/products';
import { listCertificates, listFaqs } from '@/lib/api/content';
import { listBlogPosts } from '@/lib/api/blog';
import { getTranslationMap } from '@/lib/api/translations';
import { localizeHero, localizeFaqs } from '@/lib/i18n/content-overlay';
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
  const [settings, translations] = await Promise.all([getPublicSettings(), getTranslationMap('es')]);
  const localized = localizeHero(settings, translations);
  return {
    title: settings.defaultSeoTitle ?? undefined,
    description: settings.defaultSeoDescription ?? undefined,
    alternates: { canonical: '/es', languages: { en: '/', es: '/es' } },
    openGraph: { title: localized.heroHeadline },
  };
}

export default async function SpanishHomePage() {
  const [settings, categories, featuredProducts, certificates, latestPosts, faqs, translations] =
    await Promise.all([
      getPublicSettings(),
      listProductCategories(),
      listProducts({ featured: true, pageSize: 8 }),
      listCertificates(),
      listBlogPosts({ pageSize: 3 }),
      listFaqs(),
      getTranslationMap('es'),
    ]);

  // 首页产品分类/推荐产品/证书/博客文章本批次仍然只有英文内容（见实施文档"未翻译范围"），
  // 只有 Hero 文案和 FAQ 问答叠加了西班牙语译文，未翻译字段自动回退显示英文原文。
  const localizedSettings = localizeHero(settings, translations);
  const localizedFaqs = localizeFaqs(faqs, translations);

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <JsonLd data={websiteJsonLd(settings)} />

      <HeroBanner settings={localizedSettings} />
      <CoreAdvantages items={settings.coreAdvantages} />
      <ProductCategories categories={categories} locale="es" />
      <FeaturedProducts products={featuredProducts.items} locale="es" />
      <CertificatesShowcase certificates={certificates} locale="es" />
      <LatestBlogPosts posts={latestPosts.items} locale="es" />
      <FaqPreview faqs={localizedFaqs} locale="es" />
      <InquirySection locale="es" />
    </>
  );
}
