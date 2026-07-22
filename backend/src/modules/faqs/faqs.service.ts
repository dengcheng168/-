import type { PrismaClient } from '@prisma/client';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type { CreateFaqInput, UpdateFaqInput, UpsertFaqTranslationInput } from './faqs.schema.js';

async function attachFaqTranslations<T extends { id: number }>(
  prisma: PrismaClient,
  items: T[],
  locale: string | undefined,
) {
  if (!locale || items.length === 0) return items;
  const rows = await prisma.faqTranslation.findMany({
    where: { faqId: { in: items.map((i) => i.id) }, locale, translationStatus: 'PUBLISHED' },
  });
  const byId = new Map(rows.map((r) => [r.faqId, r]));
  return items.map((item) => ({ ...item, translation: byId.get(item.id) ?? null }));
}

export async function listPublishedFaqs(prisma: PrismaClient, locale?: string) {
  const faqs = await prisma.faq.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } });
  return attachFaqTranslations(prisma, faqs, locale);
}

export async function listAdminFaqs(prisma: PrismaClient, query: PaginationQuery, search?: string) {
  const where = search ? { question: { contains: search } } : {};
  const [items, total] = await Promise.all([
    prisma.faq.findMany({ where, orderBy: { sortOrder: 'asc' }, ...toSkipTake(query) }),
    prisma.faq.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(query, total) };
}

export function getFaqById(prisma: PrismaClient, id: number) {
  return prisma.faq.findUnique({ where: { id } });
}

export function createFaq(prisma: PrismaClient, input: CreateFaqInput) {
  return prisma.faq.create({ data: input });
}

export function updateFaq(prisma: PrismaClient, id: number, input: UpdateFaqInput) {
  return prisma.faq.update({ where: { id }, data: input });
}

export function deleteFaq(prisma: PrismaClient, id: number) {
  return prisma.faq.delete({ where: { id } });
}

export async function reorderFaqs(prisma: PrismaClient, items: { id: number; sortOrder: number }[]) {
  await prisma.$transaction(
    items.map((item) => prisma.faq.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })),
  );
}

export function getFaqTranslation(prisma: PrismaClient, faqId: number, locale: string) {
  return prisma.faqTranslation.findUnique({ where: { faqId_locale: { faqId, locale } } });
}

export function upsertFaqTranslation(
  prisma: PrismaClient,
  faqId: number,
  locale: string,
  input: UpsertFaqTranslationInput,
  updatedBy?: number,
) {
  const data = { ...input, updatedBy };
  return prisma.faqTranslation.upsert({
    where: { faqId_locale: { faqId, locale } },
    create: { faqId, locale, ...data },
    update: data,
  });
}
