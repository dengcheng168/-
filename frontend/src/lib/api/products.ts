import { apiFetch, type ApiMeta } from './client';
import { resolveMediaUrl } from '@/lib/utils/media';
import type { Product, ProductCategory } from '@/types/product';
import type { Locale } from '@/lib/i18n/locales';
import { resolveLocalizedEntity, localeQueryParam, localizedTag } from '@/lib/i18n/localize';

export interface ProductListParams {
  category?: string;
  featured?: boolean;
  q?: string;
  page?: number;
  pageSize?: number;
}

type WithTranslation<T> = T & { translation?: Partial<T> | null };

const PRODUCT_TRANSLATABLE_FIELDS: (keyof Product)[] = [
  'name',
  'shortDescription',
  'description',
  'features',
  'specs',
  'applications',
  'packagingInfo',
  'moq',
  'seoTitle',
  'seoDescription',
  'seoKeywords',
];

const CATEGORY_TRANSLATABLE_FIELDS: (keyof ProductCategory)[] = ['name', 'description', 'seoTitle', 'seoDescription'];

function localizeProduct(product: WithTranslation<Product>): Product {
  const { translation, ...base } = product;
  return resolveLocalizedEntity(base as Product, translation, PRODUCT_TRANSLATABLE_FIELDS);
}

function localizeCategory(category: WithTranslation<ProductCategory>): ProductCategory {
  const { translation, ...base } = category;
  return resolveLocalizedEntity(base as ProductCategory, translation, CATEGORY_TRANSLATABLE_FIELDS);
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

export async function listProducts(
  params: ProductListParams = {},
  locale: Locale = 'en',
): Promise<{ items: Product[]; meta?: ApiMeta }> {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.featured !== undefined) search.set('featured', String(params.featured));
  if (params.q) search.set('q', params.q);
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('pageSize', String(params.pageSize));
  const localeParam = localeQueryParam(locale);
  if (localeParam) search.set('locale', localeParam);

  const qs = search.toString();
  try {
    const { data, meta } = await apiFetch<WithTranslation<Product>[]>(`/products${qs ? `?${qs}` : ''}`, {
      revalidate: 60,
      tags: ['products', ...localizedTag('products', locale)],
    });
    return { items: data.map((p) => resolveProductMedia(localizeProduct(p))), meta };
  } catch {
    // 构建期后端不可达时的兜底：见 lib/api/settings.ts 顶部注释
    return { items: [] };
  }
}

export async function getProductBySlug(
  slug: string,
  locale: Locale = 'en',
): Promise<{ product: Product; related: Product[] } | null> {
  const localeParam = localeQueryParam(locale);
  try {
    const { data } = await apiFetch<{ product: WithTranslation<Product>; related: WithTranslation<Product>[] }>(
      `/products/${slug}${localeParam ? `?locale=${localeParam}` : ''}`,
      {
        revalidate: 60,
        tags: ['products', `product:${slug}`, ...localizedTag(`product:${slug}`, locale)],
      },
    );
    return {
      product: resolveProductMedia(localizeProduct(data.product)),
      related: data.related.map((r) => resolveProductMedia(localizeProduct(r))),
    };
  } catch {
    return null;
  }
}

export async function listProductCategories(locale: Locale = 'en'): Promise<ProductCategory[]> {
  const localeParam = localeQueryParam(locale);
  try {
    const { data } = await apiFetch<WithTranslation<ProductCategory>[]>(
      `/product-categories${localeParam ? `?locale=${localeParam}` : ''}`,
      { revalidate: 300, tags: ['product-categories', ...localizedTag('product-categories', locale)] },
    );
    return data.map((c) => resolveCategoryMedia(localizeCategory(c)));
  } catch {
    return [];
  }
}

export async function getProductCategoryBySlug(
  slug: string,
  params: { page?: number; pageSize?: number } = {},
  locale: Locale = 'en',
): Promise<({ category: ProductCategory; products: Product[]; meta?: ApiMeta }) | null> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('pageSize', String(params.pageSize));
  const localeParam = localeQueryParam(locale);
  if (localeParam) search.set('locale', localeParam);
  const qs = search.toString();

  try {
    const { data, meta } = await apiFetch<{ category: WithTranslation<ProductCategory>; products: WithTranslation<Product>[] }>(
      `/product-categories/${slug}${qs ? `?${qs}` : ''}`,
      { revalidate: 300, tags: ['product-categories', ...localizedTag('product-categories', locale)] },
    );
    return {
      category: resolveCategoryMedia(localizeCategory(data.category)),
      products: data.products.map((p) => resolveProductMedia(localizeProduct(p))),
      meta,
    };
  } catch {
    return null;
  }
}
