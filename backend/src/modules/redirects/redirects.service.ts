import type { PrismaClient } from '@prisma/client';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type { CreateRedirectInput, UpdateRedirectInput } from './redirects.schema.js';

export async function listAdminRedirects(prisma: PrismaClient, query: PaginationQuery) {
  const [items, total] = await Promise.all([
    prisma.redirect.findMany({ orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
    prisma.redirect.count(),
  ]);
  return { items, meta: buildPaginationMeta(query, total) };
}

export function createRedirect(prisma: PrismaClient, input: CreateRedirectInput) {
  return prisma.redirect.create({ data: input });
}

export function updateRedirect(prisma: PrismaClient, id: number, input: UpdateRedirectInput) {
  return prisma.redirect.update({ where: { id }, data: input });
}

export function deleteRedirect(prisma: PrismaClient, id: number) {
  return prisma.redirect.delete({ where: { id } });
}

export function findRedirectByFromPath(prisma: PrismaClient, fromPath: string) {
  return prisma.redirect.findUnique({ where: { fromPath } });
}
