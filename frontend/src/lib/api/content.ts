import { apiFetch } from './client';
import { resolveMediaUrl } from '@/lib/utils/media';
import type { Certificate, Faq, Testimonial, Page } from '@/types/content';

function resolveCertificateMedia(cert: Certificate): Certificate {
  return {
    ...cert,
    imageUrl: resolveMediaUrl(cert.imageUrl),
    pdfUrl: cert.pdfUrl ? resolveMediaUrl(cert.pdfUrl) : cert.pdfUrl,
  };
}

function resolveTestimonialMedia(t: Testimonial): Testimonial {
  return { ...t, avatarUrl: t.avatarUrl ? resolveMediaUrl(t.avatarUrl) : t.avatarUrl };
}

function resolvePageMedia(page: Page): Page {
  return { ...page, ogImage: page.ogImage ? resolveMediaUrl(page.ogImage) : page.ogImage };
}

// 构建期后端不可达时的兜底空值：见 lib/api/settings.ts 顶部注释

export async function listCertificates(): Promise<Certificate[]> {
  try {
    const { data } = await apiFetch<Certificate[]>('/certificates', { revalidate: 300, tags: ['certificates'] });
    return data.map(resolveCertificateMedia);
  } catch {
    return [];
  }
}

export async function listFaqs(): Promise<Faq[]> {
  try {
    const { data } = await apiFetch<Faq[]>('/faqs', { revalidate: 300, tags: ['faqs'] });
    return data;
  } catch {
    return [];
  }
}

export async function listTestimonials(): Promise<Testimonial[]> {
  try {
    const { data } = await apiFetch<Testimonial[]>('/testimonials', { revalidate: 300, tags: ['testimonials'] });
    return data.map(resolveTestimonialMedia);
  } catch {
    return [];
  }
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const { data } = await apiFetch<Page>(`/pages/${slug}`, { revalidate: 300, tags: ['pages', `page:${slug}`] });
    return resolvePageMedia(data);
  } catch {
    return null;
  }
}
