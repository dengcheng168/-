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
      // FAQ 故意不传 locale：已有的西语问答目前存在旧的通用 Translation 表（faq.{id}.question/answer,
      // 后台"多语言设置"编辑出来的），新的 FaqTranslation 表要等 Phase G 回填后才有数据。
      // 这里继续用 localizeFaqs 叠加旧表，避免在 Phase G 跑完之前把已经上线的西语 FAQ 内容清空。
      listFaqs(),
      getTranslationMap('es'),
    ]);

  // 产品分类/推荐产品/证书/博客文章现在都通过 Phase C 的 locale-aware 数据函数请求西语翻译，
  // 缺失翻译的字段由 resolveLocalizedEntity 自动回退显示英文原文（见 lib/i18n/localize.ts）。
  const localizedSettings = localizeHero(settings, translations);
  const localizedFaqs = localizeFaqs(faqs, translations);

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
      <FaqPreview faqs={localizedFaqs} locale="es" />
      <InquirySection locale="es" />
    </>
  );
}
