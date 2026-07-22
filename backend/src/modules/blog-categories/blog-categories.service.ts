import type { PrismaClient } from '@prisma/client';
import { generateUniqueSlug } from '../../lib/slugify.js';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type {
  CreateBlogCategoryInput,
  UpdateBlogCategoryInput,
  UpsertBlogCategoryTranslationInput,
} from './blog-categories.schema.js';

async function attachCategoryTranslations<T extends { id: number }>(
  prisma: PrismaClient,
  items: T[],
  locale: string | undefined,
) {
  if (!locale || items.length === 0) return items;
  const rows = await prisma.blogCategoryTranslation.findMany({
    where: { categoryId: { in: items.map((i) => i.id) }, locale, translationStatus: 'PUBLISHED' },
  });
  const byId = new Map(rows.map((r) => [r.categoryId, r]));
  return items.map((item) => ({ ...item, translation: byId.get(item.id) ?? null }));
}

export async function listPublishedBlogCategories(prisma: PrismaClient, locale?: string) {
  const categories = await prisma.blogCategory.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });
  return attachCategoryTranslations(prisma, categories, locale);
}

export async function listAdminBlogCategories(prisma: PrismaClient, query: PaginationQuery, search?: string) {
  const where = { deletedAt: null, ...(search ? { name: { contains: search } } : {}) };
  const [items, total] = await Promise.all([
    prisma.blogCategory.findMany({ where, orderBy: { sortOrder: 'asc' }, ...toSkipTake(query) }),
    prisma.blogCategory.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(query, total) };
}

export function getBlogCategoryById(prisma: PrismaClient, id: number) {
  return prisma.blogCategory.findFirst({ where: { id, deletedAt: null } });
}

export async function createBlogCategory(prisma: PrismaClient, input: CreateBlogCategoryInput) {
  const slug = await generateUniqueSlug(input.slug ?? input.name, async (candidate) => {
    const found = await prisma.blogCategory.findUnique({ where: { slug: candidate } });
    return !!found;
  });
  return prisma.blogCategory.create({ data: { ...input, slug } });
}

export function updateBlogCategory(prisma: PrismaClient, id: number, input: UpdateBlogCategoryInput) {
  return prisma.blogCategory.update({ where: { id }, data: input });
}

export function softDeleteBlogCategory(prisma: PrismaClient, id: number) {
  return prisma.blogCategory.update({ where: { id }, data: { deletedAt: new Date() } });
}

export function getBlogCategoryTranslation(prisma: PrismaClient, categoryId: number, locale: string) {
  return prisma.blogCategoryTranslation.findUnique({ where: { categoryId_locale: { categoryId, locale } } });
}

export function upsertBlogCategoryTranslation(
  prisma: PrismaClient,
  categoryId: number,
  locale: string,
  input: UpsertBlogCategoryTranslationInput,
  updatedBy?: number,
) {
  const data = { ...input, updatedBy };
  return prisma.blogCategoryTranslation.upsert({
    where: { categoryId_locale: { categoryId, locale } },
    create: { categoryId, locale, ...data },
    update: data,
  });
}
