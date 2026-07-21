import { apiFetch } from './client';
import { resolveMediaUrl } from '@/lib/utils/media';
import type { Certificate, Faq, Page } from '@/types/content';
import type { Locale } from '@/lib/i18n/locales';
import { resolveLocalizedEntity, localeQueryParam, localizedTag } from '@/lib/i18n/localize';

type WithTranslation<T> = T & { translation?: Partial<T> | null };

const CERTIFICATE_TRANSLATABLE_FIELDS: (keyof Certificate)[] = ['name', 'description'];
const FAQ_TRANSLATABLE_FIELDS: (keyof Faq)[] = ['question', 'answer'];
const PAGE_TRANSLATABLE_FIELDS: (keyof Page)[] = ['title', 'bodyHtml', 'sections', 'seoTitle', 'seoDescription'];

function localizeCertificate(cert: WithTranslation<Certificate>): Certificate {
  const { translation, ...base } = cert;
  return resolveLocalizedEntity(base as Certificate, translation, CERTIFICATE_TRANSLATABLE_FIELDS);
}

function localizeFaq(faq: WithTranslation<Faq>): Faq {
  const { translation, ...base } = faq;
  return resolveLocalizedEntity(base as Faq, translation, FAQ_TRANSLATABLE_FIELDS);
}

function localizePage(page: WithTranslation<Page>): Page {
  const { translation, ...base } = page;
  return resolveLocalizedEntity(base as Page, translation, PAGE_TRANSLATABLE_FIELDS);
}

function resolveCertificateMedia(cert: Certificate): Certificate {
  return {
    ...cert,
    imageUrl: resolveMediaUrl(cert.imageUrl),
    pdfUrl: cert.pdfUrl ? resolveMediaUrl(cert.pdfUrl) : cert.pdfUrl,
  };
}

function resolvePageMedia(page: Page): Page {
  return {
    ...page,
    ogImage: page.ogImage ? resolveMediaUrl(page.ogImage) : page.ogImage,
    heroImage: page.heroImage ? resolveMediaUrl(page.heroImage) : page.heroImage,
    heroImageMobile: page.heroImageMobile ? resolveMediaUrl(page.heroImageMobile) : page.heroImageMobile,
  };
}

// 构建期后端不可达时的兜底空值：见 lib/api/settings.ts 顶部注释

export async function listCertificates(locale: Locale = 'en'): Promise<Certificate[]> {
  const localeParam = localeQueryParam(locale);
  try {
    const { data } = await apiFetch<WithTranslation<Certificate>[]>(
      `/certificates${localeParam ? `?locale=${localeParam}` : ''}`,
      { revalidate: 300, tags: ['certificates', ...localizedTag('certificates', locale)] },
    );
    return data.map((c) => resolveCertificateMedia(localizeCertificate(c)));
  } catch {
    return [];
  }
}

export async function listFaqs(locale: Locale = 'en'): Promise<Faq[]> {
  const localeParam = localeQueryParam(locale);
  try {
    const { data } = await apiFetch<WithTranslation<Faq>[]>(`/faqs${localeParam ? `?locale=${localeParam}` : ''}`, {
      revalidate: 300,
      tags: ['faqs', ...localizedTag('faqs', locale)],
    });
    return data.map(localizeFaq);
  } catch {
    return [];
  }
}

export async function getPageBySlug(slug: string, locale: Locale = 'en'): Promise<Page | null> {
  const localeParam = localeQueryParam(locale);
  try {
    const { data } = await apiFetch<WithTranslation<Page>>(
      `/pages/${slug}${localeParam ? `?locale=${localeParam}` : ''}`,
      { revalidate: 300, tags: ['pages', `page:${slug}`, ...localizedTag(`page:${slug}`, locale)] },
    );
    return resolvePageMedia(localizePage(data));
  } catch {
    return null;
  }
}
