import type { PrismaClient } from '@prisma/client';
import { generateUniqueSlug } from '../../lib/slugify.js';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type { CreateBlogCategoryInput, UpdateBlogCategoryInput } from './blog-categories.schema.js';

export function listPublishedBlogCategories(prisma: PrismaClient) {
  return prisma.blogCategory.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });
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
