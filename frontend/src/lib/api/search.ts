import { apiFetch } from './client';
import { resolveProductMedia, localizeProduct } from './products';
import { resolveBlogMedia, localizePost } from './blog';
import type { Locale } from '@/lib/i18n/locales';
import type { Product } from '@/types/product';
import type { BlogPost } from '@/types/blog';

export async function searchSite(q: string, locale: Locale = 'en'): Promise<{ products: Product[]; posts: BlogPost[] }> {
  if (!q.trim()) return { products: [], posts: [] };
  try {
    const { data } = await apiFetch<{ products: Product[]; posts: BlogPost[] }>(
      `/search?q=${encodeURIComponent(q)}${locale === 'es' ? '&locale=es' : ''}`,
      { cache: 'no-store' },
    );
    return { products: data.products.map((p) => resolveProductMedia(localizeProduct(p))), posts: data.posts.map((p) => resolveBlogMedia(localizePost(p))) };
  } catch {
    return { products: [], posts: [] };
  }
}
