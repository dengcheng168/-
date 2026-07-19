import { apiFetch } from './client';
import { resolveProductMedia } from './products';
import { resolveBlogMedia } from './blog';
import type { Product } from '@/types/product';
import type { BlogPost } from '@/types/blog';

export async function searchSite(q: string): Promise<{ products: Product[]; posts: BlogPost[] }> {
  if (!q.trim()) return { products: [], posts: [] };
  try {
    const { data } = await apiFetch<{ products: Product[]; posts: BlogPost[] }>(
      `/search?q=${encodeURIComponent(q)}`,
    );
    return { products: data.products.map(resolveProductMedia), posts: data.posts.map(resolveBlogMedia) };
  } catch {
    return { products: [], posts: [] };
  }
}
