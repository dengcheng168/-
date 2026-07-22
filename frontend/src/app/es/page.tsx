import type { Metadata } from 'next';
import { getPublicSettings } from '@/lib/api/settings';
import { listProductCategories, listProducts } from '@/lib/api/products';
import { listCertificates, listFaqs } from '@/lib/api/content';
import { listBlogPosts } from '@/lib/api/blog';
import { getTranslationMap } from '@/lib/api/translations';
import { localizeHero } from '@/lib/i18n/content-overlay';
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
    ...(settings.defaultSeoTitle ? { title: settings.defaultSeoTitle } : {}),
    ...(settings.defaultSeoDescription ? { description: settings.defaultSeoDescription } : {}),
    alternates: { canonical: '/es', languages: { en: '/', es: '/es', 'x-default': '/' } },
    openGraph: { locale: 'es', alternateLocale: 'en', title: localized.heroHeadline },
  };
}

export default async function SpanishHomePage() {
  const [settings, categories, featuredProducts, certificates, latestPosts, faqs, translations] =
    await Promise.all([
      getPublicSettings(),
      listProductCategories('es'),
      listProducts({ featured: true, pageSize: 8 }, 'es'),
      listCertificates('es'),
      listBlogPosts({ pageSize: 3 }, 'es'),
      // listFaqs('es') 内部按 FaqTranslation 已发布内容优先、旧 Translation 表兼容、
      // 英文原文兜底的三级顺序解析，见 lib/api/content.ts 和 lib/i18n/faq-source.ts
      listFaqs('es'),
      getTranslationMap('es'),
    ]);

  // 产品分类/推荐产品/证书/博客文章/FAQ 现在都通过 locale-aware 数据函数请求西语翻译，
  // 缺失翻译的字段自动回退显示英文原文（见 lib/i18n/localize.ts 和 lib/i18n/faq-source.ts）。
  const localizedSettings = localizeHero(settings, translations);

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <JsonLd data={websiteJsonLd(settings, 'es')} />

      <HeroBanner settings={localizedSettings} locale="es" />
      <CoreAdvantages items={settings.coreAdvantages} />
      <ProductCategories categories={categories} locale="es" />
      <FeaturedProducts products={featuredProducts.items} locale="es" />
      <CertificatesShowcase certificates={certificates} locale="es" />
      <LatestBlogPosts posts={latestPosts.items} locale="es" />
      <FaqPreview faqs={faqs} locale="es" />
      <InquirySection locale="es" />
    </>
  );
}
