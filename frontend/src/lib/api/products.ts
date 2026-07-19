import { apiFetch, type ApiMeta } from './client';
import { resolveMediaUrl } from '@/lib/utils/media';
import type { Product, ProductCategory } from '@/types/product';

export interface ProductListParams {
  category?: string;
  featured?: boolean;
  q?: string;
  page?: number;
  pageSize?: number;
}

export function resolveProductMedia(product: Product): Product {
  return {
    ...product,
    mainImage: resolveMediaUrl(product.mainImage),
    ogImage: product.ogImage ? resolveMediaUrl(product.ogImage) : product.ogImage,
    specSheetUrl: product.specSheetUrl ? resolveMediaUrl(product.specSheetUrl) : product.specSheetUrl,
    galleryImages: product.galleryImages.map((img) => ({ ...img, url: resolveMediaUrl(img.url) })),
  };
}

function resolveCategoryMedia(category: ProductCategory): ProductCategory {
  return { ...category, image: category.image ? resolveMediaUrl(category.image) : category.image };
}

export async function listProducts(params: ProductListParams = {}): Promise<{ items: Product[]; meta?: ApiMeta }> {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.featured !== undefined) search.set('featured', String(params.featured));
  if (params.q) search.set('q', params.q);
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('pageSize', String(params.pageSize));

  const qs = search.toString();
  try {
    const { data, meta } = await apiFetch<Product[]>(`/products${qs ? `?${qs}` : ''}`, {
      revalidate: 60,
      tags: ['products'],
    });
    return { items: data.map(resolveProductMedia), meta };
  } catch {
    // 构建期后端不可达时的兜底：见 lib/api/settings.ts 顶部注释
    return { items: [] };
  }
}

export async function getProductBySlug(slug: string): Promise<{ product: Product; related: Product[] } | null> {
  try {
    const { data } = await apiFetch<{ product: Product; related: Product[] }>(`/products/${slug}`, {
      revalidate: 60,
      tags: ['products', `product:${slug}`],
    });
    return { product: resolveProductMedia(data.product), related: data.related.map(resolveProductMedia) };
  } catch {
    return null;
  }
}

export async function listProductCategories(): Promise<ProductCategory[]> {
  try {
    const { data } = await apiFetch<ProductCategory[]>('/product-categories', {
      revalidate: 300,
      tags: ['product-categories'],
    });
    return data.map(resolveCategoryMedia);
  } catch {
    return [];
  }
}

export async function getProductCategoryBySlug(
  slug: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<({ category: ProductCategory; products: Product[]; meta?: ApiMeta }) | null> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('pageSize', String(params.pageSize));
  const qs = search.toString();

  try {
    const { data, meta } = await apiFetch<{ category: ProductCategory; products: Product[] }>(
      `/product-categories/${slug}${qs ? `?${qs}` : ''}`,
      { revalidate: 300, tags: ['product-categories'] },
    );
    return { category: resolveCategoryMedia(data.category), products: data.products.map(resolveProductMedia), meta };
  } catch {
    return null;
  }
}
