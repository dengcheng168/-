import type { PrismaClient } from '@prisma/client';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type {
  CreateFactoryGalleryItemInput,
  UpdateFactoryGalleryItemInput,
  UpsertFactoryGalleryItemTranslationInput,
} from './factory-gallery.schema.js';

async function attachTranslations<T extends { id: number }>(
  prisma: PrismaClient,
  items: T[],
  locale: string | undefined,
) {
  if (!locale || items.length === 0) return items;
  const rows = await prisma.factoryGalleryItemTranslation.findMany({
    where: { itemId: { in: items.map((i) => i.id) }, locale, translationStatus: 'PUBLISHED' },
  });
  const byId = new Map(rows.map((r) => [r.itemId, r]));
  return items.map((item) => ({ ...item, translation: byId.get(item.id) ?? null }));
}

export async function listPublishedFactoryGalleryItems(prisma: PrismaClient, locale?: string) {
  const items = await prisma.factoryGalleryItem.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });
  return attachTranslations(prisma, items, locale);
}

export async function listAdminFactoryGalleryItems(prisma: PrismaClient, query: PaginationQuery, search?: string) {
  const where = { deletedAt: null, ...(search ? { title: { contains: search } } : {}) };
  const [items, total] = await Promise.all([
    prisma.factoryGalleryItem.findMany({ where, orderBy: { sortOrder: 'asc' }, ...toSkipTake(query) }),
    prisma.factoryGalleryItem.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(query, total) };
}

export function getFactoryGalleryItemById(prisma: PrismaClient, id: number) {
  return prisma.factoryGalleryItem.findFirst({ where: { id, deletedAt: null } });
}

export function createFactoryGalleryItem(prisma: PrismaClient, input: CreateFactoryGalleryItemInput) {
  return prisma.factoryGalleryItem.create({ data: input });
}

/** 更新前先确认记录仍然存在且未被软删除，做法同 certificates.service.ts 的 updateCertificate */
export async function updateFactoryGalleryItem(prisma: PrismaClient, id: number, input: UpdateFactoryGalleryItemInput) {
  const existing = await prisma.factoryGalleryItem.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;
  return prisma.factoryGalleryItem.update({ where: { id }, data: input });
}

export function softDeleteFactoryGalleryItem(prisma: PrismaClient, id: number) {
  return prisma.factoryGalleryItem.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function reorderFactoryGalleryItems(prisma: PrismaClient, items: { id: number; sortOrder: number }[]) {
  await prisma.$transaction(
    items.map((item) => prisma.factoryGalleryItem.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })),
  );
}

export function getFactoryGalleryItemTranslation(prisma: PrismaClient, itemId: number, locale: string) {
  return prisma.factoryGalleryItemTranslation.findUnique({ where: { itemId_locale: { itemId, locale } } });
}

export function upsertFactoryGalleryItemTranslation(
  prisma: PrismaClient,
  itemId: number,
  locale: string,
  input: UpsertFactoryGalleryItemTranslationInput,
  updatedBy?: number,
) {
  const data = { ...input, updatedBy };
  return prisma.factoryGalleryItemTranslation.upsert({
    where: { itemId_locale: { itemId, locale } },
    create: { itemId, locale, ...data },
    update: data,
  });
}
