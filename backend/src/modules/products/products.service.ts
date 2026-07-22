import type { PrismaClient, Product, Prisma, ProductTranslation } from '@prisma/client';
import { generateUniqueSlug } from '../../lib/slugify.js';
import { fromJsonString, toJsonString } from '../../lib/json.js';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import { sanitizeRichText } from '../../lib/sanitize.js';
import { attachNestedProductCategoryTranslations } from '../../lib/nested-category.js';
import type { CreateProductInput, UpdateProductInput, UpsertProductTranslationInput } from './products.schema.js';

/**
 * 泛型而不是固定用 Product 类型，是为了让 include 了 category 关联的查询结果
 * 在序列化后依然保留 category 字段（普通函数签名 (product: Product) 会让
 * TypeScript 按 Product 类型本身的已知字段推断返回值，实际运行时多出来的
 * category 属性会被"抹掉"，导致后面 attachNestedProductCategoryTranslations
 * 读不到它）。
 */
export function serializeProduct<T extends Product>(product: T) {
  return {
    ...product,
    galleryImages: fromJsonString(product.galleryImages, []),
    specs: fromJsonString(product.specs, []),
    features: fromJsonString(product.features, []),
    applications: fromJsonString(product.applications, []),
  };
}

export function serializeProductTranslation(translation: ProductTranslation) {
  return {
    ...translation,
    specs: fromJsonString<unknown[] | null>(translation.specs, null),
    features: fromJsonString<unknown[] | null>(translation.features, null),
    applications: fromJsonString<unknown[] | null>(translation.applications, null),
  };
}

/**
 * 批量把一批产品各自的西语翻译贴到序列化结果的 translation 字段上——只在真的传了 locale 才查，
 * 不传 locale（英文默认路径）完全不碰 ProductTranslation 表，一次额外查询都不会有。
 */
export async function attachProductTranslations<T extends { id: number }>(
  prisma: PrismaClient,
  items: T[],
  locale: string | undefined,
): Promise<(T & { translation?: ReturnType<typeof serializeProductTranslation> | null })[]> {
  if (!locale || items.length === 0) return items;
  const rows = await prisma.productTranslation.findMany({
    where: { productId: { in: items.map((i) => i.id) }, locale, translationStatus: 'PUBLISHED' },
  });
  const byId = new Map(rows.map((r) => [r.productId, serializeProductTranslation(r)]));
  return items.map((item) => ({ ...item, translation: byId.get(item.id) ?? null }));
}

function toDbData(input: Partial<CreateProductInput>): Prisma.ProductUncheckedCreateInput {
  const { galleryImages, specs, features, applications, description, ...rest } = input;
  return {
    ...rest,
    ...(description !== undefined ? { description: sanitizeRichText(description) } : {}),
    ...(galleryImages !== undefined ? { galleryImages: toJsonString(galleryImages) } : {}),
    ...(specs !== undefined ? { specs: toJsonString(specs) } : {}),
    ...(features !== undefined ? { features: toJsonString(features) } : {}),
    ...(applications !== undefined ? { applications: toJsonString(applications) } : {}),
  } as Prisma.ProductUncheckedCreateInput;
}

export async function listPublicProducts(
  prisma: PrismaClient,
  query: PaginationQuery,
  filters: { categorySlug?: string; featured?: boolean; q?: string; locale?: string },
) {
  const where = {
    status: 'PUBLISHED',
    deletedAt: null,
    ...(filters.featured !== undefined ? { featured: filters.featured } : {}),
    ...(filters.q ? { name: { contains: filters.q } } : {}),
    ...(filters.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
      ...toSkipTake(query),
    }),
    prisma.product.count({ where }),
  ]);

  const withOwnTranslation = await attachProductTranslations(prisma, items.map(serializeProduct), filters.locale);
  return {
    items: await attachNestedProductCategoryTranslations(prisma, withOwnTranslation, filters.locale),
    meta: buildPaginationMeta(query, total),
  };
}

export async function getPublicProductBySlug(prisma: PrismaClient, slug: string, locale?: string) {
  const product = await prisma.product.findFirst({
    where: { slug, status: 'PUBLISHED', deletedAt: null },
    include: { category: true },
  });
  if (!product) return null;

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: 'PUBLISHED',
      deletedAt: null,
      id: { not: product.id },
    },
    orderBy: { sortOrder: 'asc' },
    include: { category: true },
    take: 4,
  });

  const localizedProducts = await attachProductTranslations(prisma, [serializeProduct(product)], locale);
  const localizedRelated = await attachProductTranslations(prisma, related.map(serializeProduct), locale);

  const [productsWithCategory, relatedWithCategory] = await Promise.all([
    attachNestedProductCategoryTranslations(prisma, localizedProducts, locale),
    attachNestedProductCategoryTranslations(prisma, localizedRelated, locale),
  ]);

  return {
    // localizedProducts 由 [serializeProduct(product)] 生成，长度恒为 1，这里安全非空断言
    product: productsWithCategory[0]!,
    related: relatedWithCategory,
  };
}

export async function listAdminProducts(
  prisma: PrismaClient,
  query: PaginationQuery,
  filters: { q?: string; status?: string; categoryId?: number },
) {
  const where = {
    deletedAt: null,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.q ? { name: { contains: filters.q } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
      ...toSkipTake(query),
    }),
    prisma.product.count({ where }),
  ]);

  return { items: items.map(serializeProduct), meta: buildPaginationMeta(query, total) };
}

export async function getAdminProductById(prisma: PrismaClient, id: number) {
  const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  return product ? serializeProduct(product) : null;
}

export async function createProduct(prisma: PrismaClient, input: CreateProductInput) {
  const slug = await generateUniqueSlug(input.slug ?? input.name, async (candidate) => {
    const found = await prisma.product.findUnique({ where: { slug: candidate } });
    return !!found;
  });

  const product = await prisma.product.create({ data: { ...toDbData(input), slug } });
  return serializeProduct(product);
}

/**
 * 更新前先确认产品仍然存在且未被软删除，避免并发场景下"复活"一个已经被删除的产品
 * （Prisma update 本身不会检查 deletedAt，如果不加这层判断，编辑页面还开着时产品被删，
 * 保存操作会直接把它悄悄改回未删除状态）。返回 null 交给 controller 转成 404。
 */
export async function updateProduct(prisma: PrismaClient, id: number, input: UpdateProductInput) {
  const existing = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const product = await prisma.product.update({ where: { id }, data: toDbData(input) });
  return serializeProduct(product);
}

export function softDeleteProduct(prisma: PrismaClient, id: number) {
  return prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
}

export function updateProductStatus(prisma: PrismaClient, id: number, status: string) {
  return prisma.product.update({ where: { id }, data: { status } });
}

export function toggleProductFeatured(prisma: PrismaClient, id: number, featured: boolean) {
  return prisma.product.update({ where: { id }, data: { featured } });
}

export async function reorderProducts(prisma: PrismaClient, items: { id: number; sortOrder: number }[]) {
  await prisma.$transaction(
    items.map((item) => prisma.product.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })),
  );
}

export async function bulkUpdateProductStatus(prisma: PrismaClient, ids: number[], status: string) {
  await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status } });
}

export async function getProductTranslation(prisma: PrismaClient, productId: number, locale: string) {
  const translation = await prisma.productTranslation.findUnique({
    where: { productId_locale: { productId, locale } },
  });
  return translation ? serializeProductTranslation(translation) : null;
}

export async function upsertProductTranslation(
  prisma: PrismaClient,
  productId: number,
  locale: string,
  input: UpsertProductTranslationInput,
  updatedBy?: number,
) {
  const { specs, features, applications, ...rest } = input;
  const data = {
    ...rest,
    ...(specs !== undefined ? { specs: toJsonString(specs) } : {}),
    ...(features !== undefined ? { features: toJsonString(features) } : {}),
    ...(applications !== undefined ? { applications: toJsonString(applications) } : {}),
    updatedBy,
  };
  const translation = await prisma.productTranslation.upsert({
    where: { productId_locale: { productId, locale } },
    create: { productId, locale, ...data },
    update: data,
  });
  return serializeProductTranslation(translation);
}
