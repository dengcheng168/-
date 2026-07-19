import type { PrismaClient } from '@prisma/client';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type { CreateCertificateInput, UpdateCertificateInput } from './certificates.schema.js';

export function listPublishedCertificates(prisma: PrismaClient) {
  return prisma.certificate.findMany({ where: { published: true, deletedAt: null }, orderBy: { sortOrder: 'asc' } });
}

export async function listAdminCertificates(prisma: PrismaClient, query: PaginationQuery, search?: string) {
  const where = { deletedAt: null, ...(search ? { name: { contains: search } } : {}) };
  const [items, total] = await Promise.all([
    prisma.certificate.findMany({ where, orderBy: { sortOrder: 'asc' }, ...toSkipTake(query) }),
    prisma.certificate.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(query, total) };
}

export function getCertificateById(prisma: PrismaClient, id: number) {
  return prisma.certificate.findFirst({ where: { id, deletedAt: null } });
}

export function createCertificate(prisma: PrismaClient, input: CreateCertificateInput) {
  return prisma.certificate.create({ data: input });
}

export function updateCertificate(prisma: PrismaClient, id: number, input: UpdateCertificateInput) {
  return prisma.certificate.update({ where: { id }, data: input });
}

export function softDeleteCertificate(prisma: PrismaClient, id: number) {
  return prisma.certificate.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function reorderCertificates(prisma: PrismaClient, items: { id: number; sortOrder: number }[]) {
  await prisma.$transaction(
    items.map((item) => prisma.certificate.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })),
  );
}
