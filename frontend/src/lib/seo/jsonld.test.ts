import { test } from 'node:test';
import assert from 'node:assert/strict';
import { productJsonLd, articleJsonLd, faqPageJsonLd, websiteJsonLd } from './jsonld';
import type { Product } from '@/types/product';
import type { BlogPost } from '@/types/blog';
import type { Faq } from '@/types/content';
import type { PublicSiteSettings } from '@/types/settings';

const product: Product = {
  id: 1,
  name: 'RO-500',
  slug: 'ro-500',
  sku: 'RO-500',
  categoryId: 1,
  shortDescription: 'A compact RO system.',
  description: 'Full description.',
  mainImage: '/uploads/ro-500.webp',
  galleryImages: [],
  specs: [],
  features: [],
  applications: [],
  packagingInfo: null,
  moq: null,
  oemOdmSupport: true,
  specSheetUrl: null,
  status: 'PUBLISHED',
  featured: false,
  sortOrder: 1,
  seoTitle: null,
  seoDescription: null,
  seoKeywords: null,
  ogImage: null,
};

const post: BlogPost = {
  id: 1,
  title: 'Water Filtration 101',
  slug: 'water-filtration-101',
  excerpt: 'An intro.',
  body: 'Body text.',
  coverImage: null,
  categoryId: 1,
  authorName: 'KoiGate Tech',
  status: 'PUBLISHED',
  publishedAt: '2026-01-01T00:00:00.000Z',
  seoTitle: null,
  seoDescription: null,
  tags: [],
};

const faqs: Faq[] = [{ id: 1, question: 'What is RO?', answer: 'Reverse osmosis.', category: null }];

const settings: PublicSiteSettings = {
  companyName: 'KoiGate Tech',
  companyLogoUrl: null,
  faviconUrl: null,
  companyAddress: null,
  companyEmail: null,
  companyPhone: null,
  whatsappNumber: null,
  whatsappLink: null,
  socialLinks: [],
  turnstileEnabled: false,
  turnstileSiteKey: null,
  defaultSeoTitle: null,
  defaultSeoDescription: null,
  defaultOgImage: null,
  heroHeadline: '',
  heroSubheadline: '',
  heroButton1Text: '',
  heroButton1Link: '',
  heroButton2Text: '',
  heroButton2Link: '',
  heroDesktopImage: null,
  heroMobileImage: null,
  coreAdvantages: [],
  stats: [],
  oemProcessSteps: [],
  factoryStats: [],
  factoryPhotos: [],
  partnerRegions: [],
  footerText: null,
  footerColumns: null,
  footerCompanyIntro: null,
  metaPixelId: null,
  tiktokPixelId: null,
  googlePixelId: null,
};

test('productJsonLd: defaults inLanguage to "en" and links to the English URL', () => {
  const result = productJsonLd(product);
  assert.equal(result.inLanguage, 'en');
  assert.equal(result.url, 'http://localhost:3000/products/ro-500');
});

test('productJsonLd: locale="es" sets inLanguage and links to the /es URL', () => {
  const result = productJsonLd(product, 'es');
  assert.equal(result.inLanguage, 'es');
  assert.equal(result.url, 'http://localhost:3000/es/products/ro-500');
});

test('articleJsonLd: locale="es" sets inLanguage and links to the /es blog URL', () => {
  const result = articleJsonLd(post, 'es');
  assert.equal(result.inLanguage, 'es');
  assert.equal(result.url, 'http://localhost:3000/es/blog/water-filtration-101');
});

test('articleJsonLd: defaults to English when locale omitted', () => {
  const result = articleJsonLd(post);
  assert.equal(result.inLanguage, 'en');
  assert.equal(result.url, 'http://localhost:3000/blog/water-filtration-101');
});

test('faqPageJsonLd: inLanguage matches the passed locale', () => {
  assert.equal(faqPageJsonLd(faqs, 'es').inLanguage, 'es');
  assert.equal(faqPageJsonLd(faqs, 'en').inLanguage, 'en');
  assert.equal(faqPageJsonLd(faqs).inLanguage, 'en');
});

test('faqPageJsonLd: maps each faq to a Question/Answer pair', () => {
  const result = faqPageJsonLd(faqs, 'en');
  assert.equal(result.mainEntity.length, 1);
  assert.equal(result.mainEntity[0]!.name, 'What is RO?');
  assert.equal(result.mainEntity[0]!.acceptedAnswer.text, 'Reverse osmosis.');
});

test('websiteJsonLd: url points at the localized homepage', () => {
  assert.equal(websiteJsonLd(settings, 'es').url, 'http://localhost:3000/es');
  assert.equal(websiteJsonLd(settings, 'en').url, 'http://localhost:3000/');
});
