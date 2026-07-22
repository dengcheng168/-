import type { Product } from '@/types/product';
import type { BlogPost } from '@/types/blog';
import type { Faq } from '@/types/content';
import type { PublicSiteSettings } from '@/types/settings';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';
import { absoluteUrl } from './site';

export function organizationJsonLd(settings: PublicSiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.companyName,
    url: absoluteUrl('/'),
    logo: settings.companyLogoUrl ? absoluteUrl(settings.companyLogoUrl) : undefined,
    email: settings.companyEmail ?? undefined,
    telephone: settings.companyPhone ?? undefined,
    address: settings.companyAddress ?? undefined,
  };
}

export function websiteJsonLd(settings: PublicSiteSettings, locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.companyName,
    url: absoluteUrl(localeHref('/', locale)),
    inLanguage: locale,
  };
}

export function breadcrumbListJsonLd(items: { label: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

export function productJsonLd(product: Product, locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.seoDescription ?? undefined,
    image: product.mainImage ? absoluteUrl(product.mainImage) : undefined,
    sku: product.sku ?? undefined,
    url: absoluteUrl(localeHref(`/products/${product.slug}`, locale)),
    inLanguage: locale,
  };
}

export function articleJsonLd(post: BlogPost, locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ? absoluteUrl(post.coverImage) : undefined,
    datePublished: post.publishedAt ?? undefined,
    author: { '@type': 'Organization', name: post.authorName },
    url: absoluteUrl(localeHref(`/blog/${post.slug}`, locale)),
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
