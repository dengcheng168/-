import type { PrismaClient } from '@prisma/client';
import { generateUniqueSlug } from '../../lib/slugify.js';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.schema.js';

export function listPublishedCategories(prisma: PrismaClient) {
  return prisma.productCategory.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });
}

export function getPublishedCategoryBySlug(prisma: PrismaClient, slug: string) {
  return prisma.productCategory.findFirst({
    where: { slug, published: true, deletedAt: null },
  });
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
