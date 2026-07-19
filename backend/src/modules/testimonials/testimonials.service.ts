import type { PrismaClient } from '@prisma/client';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type { CreateTestimonialInput, UpdateTestimonialInput } from './testimonials.schema.js';

export function listPublishedTestimonials(prisma: PrismaClient) {
  return prisma.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } });
}

export async function listAdminTestimonials(prisma: PrismaClient, query: PaginationQuery, search?: string) {
  const where = search ? { authorName: { contains: search } } : {};
  const [items, total] = await Promise.all([
    prisma.testimonial.findMany({ where, orderBy: { sortOrder: 'asc' }, ...toSkipTake(query) }),
    prisma.testimonial.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(query, total) };
}

export function getTestimonialById(prisma: PrismaClient, id: number) {
  return prisma.testimonial.findUnique({ where: { id } });
}

export function createTestimonial(prisma: PrismaClient, input: CreateTestimonialInput) {
  return prisma.testimonial.create({ data: input });
}

export function updateTestimonial(prisma: PrismaClient, id: number, input: UpdateTestimonialInput) {
  return prisma.testimonial.update({ where: { id }, data: input });
}

export function deleteTestimonial(prisma: PrismaClient, id: number) {
  return prisma.testimonial.delete({ where: { id } });
}

export async function reorderTestimonials(prisma: PrismaClient, items: { id: number; sortOrder: number }[]) {
  await prisma.$transaction(
    items.map((item) => prisma.testimonial.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })),
  );
}
