import type { Product } from '@/types/product';
import type { BlogPost } from '@/types/blog';
import type { Certificate, Faq } from '@/types/content';
import type { PublicSiteSettings } from '@/types/settings';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';

/**
 * 所有 JSON-LD helper 都是纯函数：siteUrl 由调用方（Server Component）通过
 * getSiteUrl()/lib/seo/site.ts 解析一次后传入，而不是每个 helper 自己内部再去请求一次
 * 域名配置——见 Runtime Site Domain Configuration 需求「八」："不要让 Header、Footer、
 * ProductCard 各自读取站点域名"同样适用于这里。好处是这些函数保持同步、不依赖网络请求，
 * 可以直接单元测试（见 jsonld.test.ts），不需要在测试里 mock fetch 或起一个真实后端。
 */
function toAbsolute(siteUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function organizationJsonLd(settings: PublicSiteSettings, siteUrl: string) {
  const organizationId = toAbsolute(siteUrl, '/#organization');
  const sameAs = settings.socialLinks
    .filter((link) => link.enabled && /^https?:\/\//i.test(link.url))
    .map((link) => link.url);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId,
    name: settings.companyName,
    legalName: settings.companyName,
    alternateName: settings.brandName ?? undefined,
    description: settings.defaultSeoDescription ?? settings.footerCompanyIntro ?? undefined,
    url: toAbsolute(siteUrl, '/'),
    logo: settings.companyLogoUrl ? toAbsolute(siteUrl, settings.companyLogoUrl) : undefined,
    email: settings.companyEmail ?? undefined,
    telephone: settings.companyPhone ?? undefined,
    address: settings.companyAddress
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.companyAddress,
          addressCountry: 'CN',
        }
      : undefined,
    contactPoint: settings.companyEmail || settings.companyPhone
      ? {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: settings.companyEmail ?? undefined,
          telephone: settings.companyPhone ?? undefined,
          availableLanguage: ['English', 'Spanish'],
        }
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

export function websiteJsonLd(settings: PublicSiteSettings, siteUrl: string, locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${toAbsolute(siteUrl, localeHref('/', locale))}#website`,
    name: settings.companyName,
    url: toAbsolute(siteUrl, localeHref('/', locale)),
    inLanguage: locale,
  };
}

export function breadcrumbListJsonLd(items: { label: string; href: string }[], siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: toAbsolute(siteUrl, item.href),
    })),
  };
}

export function productJsonLd(
  product: Product,
  siteUrl: string,
  locale: Locale = 'en',
) {
  const images = [...new Set([
    product.mainImage,
    ...product.galleryImages.map((image) => image.url),
  ].filter(Boolean))].map((image) => toAbsolute(siteUrl, image));

  return {
    '@context': 'https://schema.org',
    // These are quote-request pages: there is no public checkout price and no
    // first-party review corpus. Publishing Product markup without a real
    // offer/review makes the item invalid for Google's Product snippets. Keep
    // accurate page-level metadata instead of manufacturing commercial data.
    '@type': 'WebPage',
    name: product.name,
    description: product.shortDescription ?? product.seoDescription ?? undefined,
    primaryImageOfPage: images[0]
      ? { '@type': 'ImageObject', url: images[0] }
      : undefined,
    url: toAbsolute(siteUrl, localeHref(`/products/${product.slug}`, locale)),
    inLanguage: locale,
  };
}

export function aboutPageJsonLd(
  settings: PublicSiteSettings,
  siteUrl: string,
  locale: Locale = 'en',
) {
  const url = toAbsolute(siteUrl, localeHref('/about', locale));
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${url}#about-page`,
    url,
    name: locale === 'es' ? `Sobre ${settings.brandName || settings.companyName}` : `About ${settings.brandName || settings.companyName}`,
    inLanguage: locale,
    about: { '@id': toAbsolute(siteUrl, '/#organization') },
    isPartOf: { '@id': `${toAbsolute(siteUrl, localeHref('/', locale))}#website` },
  };
}

export function articleJsonLd(post: BlogPost, siteUrl: string, locale: Locale = 'en') {
  const articleUrl = toAbsolute(siteUrl, localeHref(`/blog/${post.slug}`, locale));

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ? toAbsolute(siteUrl, post.coverImage) : undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: post.authorName },
    url: articleUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    inLanguage: locale,
  };
}

export function faqPageJsonLd(faqs: readonly Pick<Faq, 'question' | 'answer'>[], locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function certificateItemListJsonLd(
  certificates: readonly Certificate[],
  siteUrl: string,
  organizationName: string,
  locale: Locale = 'en',
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'es' ? 'Certificados y documentos de conformidad' : 'Certificates and conformity documents',
    inLanguage: locale,
    itemListElement: certificates.map((certificate, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: certificate.name,
        identifier: certificate.certNumber ?? undefined,
        image: toAbsolute(siteUrl, certificate.imageUrl),
        datePublished: certificate.issueDate ?? undefined,
        expires: certificate.expiryDate ?? undefined,
        publisher: certificate.issuingAuthority
          ? { '@type': 'Organization', name: certificate.issuingAuthority }
          : undefined,
        sourceOrganization: { '@type': 'Organization', name: organizationName },
        about: certificate.applicableProductType || (certificate.applicableModels?.length ?? 0) > 0
          ? [certificate.applicableProductType, ...(certificate.applicableModels ?? [])].filter(Boolean)
          : undefined,
      },
    })),
  };
}
