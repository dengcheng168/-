import type { PrismaClient } from '@prisma/client';
import { generateUniqueSlug } from '../../lib/slugify.js';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type { CreateCategoryInput, UpdateCategoryInput, UpsertCategoryTranslationInput } from './categories.schema.js';

/** 同 products 模块的 attachTranslations——只在传了 locale 才查一次批量翻译，不传时零额外开销 */
async function attachCategoryTranslations<T extends { id: number }>(
  prisma: PrismaClient,
  items: T[],
  locale: string | undefined,
) {
  if (!locale || items.length === 0) return items;
  const rows = await prisma.productCategoryTranslation.findMany({
    where: { categoryId: { in: items.map((i) => i.id) }, locale, translationStatus: 'PUBLISHED' },
  });
  const byId = new Map(rows.map((r) => [r.categoryId, r]));
  return items.map((item) => ({ ...item, translation: byId.get(item.id) ?? null }));
}

export async function listPublishedCategories(prisma: PrismaClient, locale?: string) {
  const categories = await prisma.productCategory.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });
  return attachCategoryTranslations(prisma, categories, locale);
}

export async function getPublishedCategoryBySlug(prisma: PrismaClient, slug: string, locale?: string) {
  const category = await prisma.productCategory.findFirst({
    where: { slug, published: true, deletedAt: null },
  });
  if (!category) return null;
  const [localized] = await attachCategoryTranslations(prisma, [category], locale);
  return localized;
}

export async function listAdminCategories(
  prisma: PrismaClient,
  query: PaginationQuery,
  search?: string,
) {
  const where = {
    deletedAt: null,
    ...(search ? { name: { contains: search } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.productCategory.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      ...toSkipTake(query),
    }),
    prisma.productCategory.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(query, total) };
}

export function getCategoryById(prisma: PrismaClient, id: number) {
  return prisma.productCategory.findFirst({ where: { id, deletedAt: null } });
}

export async function createCategory(prisma: PrismaClient, input: CreateCategoryInput) {
  const slug = await generateUniqueSlug(input.slug ?? input.name, async (candidate) => {
    const found = await prisma.productCategory.findUnique({ where: { slug: candidate } });
    return !!found;
  });

  return prisma.productCategory.create({
    data: { ...input, slug },
  });
}

export function updateCategory(prisma: PrismaClient, id: number, input: UpdateCategoryInput) {
  return prisma.productCategory.update({ where: { id }, data: input });
}

export function softDeleteCategory(prisma: PrismaClient, id: number) {
  return prisma.productCategory.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function reorderCategories(
  prisma: PrismaClient,
  items: { id: number; sortOrder: number }[],
) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.productCategory.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } }),
    ),
  );
}

export function getCategoryTranslation(prisma: PrismaClient, categoryId: number, locale: string) {
  return prisma.productCategoryTranslation.findUnique({ where: { categoryId_locale: { categoryId, locale } } });
}

export function upsertCategoryTranslation(
  prisma: PrismaClient,
  categoryId: number,
  locale: string,
  input: UpsertCategoryTranslationInput,
  updatedBy?: number,
) {
  const data = { ...input, updatedBy };
  return prisma.productCategoryTranslation.upsert({
    where: { categoryId_locale: { categoryId, locale } },
    create: { categoryId, locale, ...data },
    update: data,
  });
}
