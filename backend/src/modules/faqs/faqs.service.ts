import type { PrismaClient } from '@prisma/client';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type { CreateFaqInput, UpdateFaqInput } from './faqs.schema.js';

export function listPublishedFaqs(prisma: PrismaClient) {
  return prisma.faq.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } });
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
