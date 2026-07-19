import type { PrismaClient, Product, Prisma } from '@prisma/client';
import { generateUniqueSlug } from '../../lib/slugify.js';
import { fromJsonString, toJsonString } from '../../lib/json.js';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import { sanitizeRichText } from '../../lib/sanitize.js';
import type { CreateProductInput, UpdateProductInput } from './products.schema.js';

export function serializeProduct(product: Product) {
  return {
    ...product,
    galleryImages: fromJsonString(product.galleryImages, []),
    specs: fromJsonString(product.specs, []),
    features: fromJsonString(product.features, []),
    applications: fromJsonString(product.applications, []),
  };
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
  filters: { categorySlug?: string; featured?: boolean; q?: string },
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

  return {
    items: items.map(serializeProduct),
    meta: buildPaginationMeta(query, total),
  };
}

export async function getPublicProductBySlug(prisma: PrismaClient, slug: string) {
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
    take: 4,
  });

  return {
    product: serializeProduct(product),
    related: related.map(serializeProduct),
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

export async function updateProduct(prisma: PrismaClient, id: number, input: UpdateProductInput) {
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
