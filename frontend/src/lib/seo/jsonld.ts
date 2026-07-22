import type { Product } from '@/types/product';
import type { BlogPost } from '@/types/blog';
import type { Faq } from '@/types/content';
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
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function organizationJsonLd(settings: PublicSiteSettings, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.companyName,
    url: toAbsolute(siteUrl, '/'),
    logo: settings.companyLogoUrl ? toAbsolute(siteUrl, settings.companyLogoUrl) : undefined,
    email: settings.companyEmail ?? undefined,
    telephone: settings.companyPhone ?? undefined,
    address: settings.companyAddress ?? undefined,
  };
}

export function websiteJsonLd(settings: PublicSiteSettings, siteUrl: string, locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
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

export function productJsonLd(product: Product, siteUrl: string, locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.seoDescription ?? undefined,
    image: product.mainImage ? toAbsolute(siteUrl, product.mainImage) : undefined,
    sku: product.sku ?? undefined,
    url: toAbsolute(siteUrl, localeHref(`/products/${product.slug}`, locale)),
    inLanguage: locale,
  };
}

export function articleJsonLd(post: BlogPost, siteUrl: string, locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ? toAbsolute(siteUrl, post.coverImage) : undefined,
    datePublished: post.publishedAt ?? undefined,
    author: { '@type': 'Organization', name: post.authorName },
    url: toAbsolute(siteUrl, localeHref(`/blog/${post.slug}`, locale)),
    inLanguage: locale,
  };
}

export function faqPageJsonLd(faqs: Faq[], locale: Locale = 'en') {
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
