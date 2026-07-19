import type { PrismaClient } from '@prisma/client';
import type { CreateNavItemInput, UpdateNavItemInput } from './navigation.schema.js';

export async function listVisibleNavigation(prisma: PrismaClient) {
  const items = await prisma.navigationItem.findMany({
    where: { visible: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: { children: { where: { visible: true }, orderBy: { sortOrder: 'asc' } } },
  });
  return items;
}

export function listAllNavigation(prisma: PrismaClient) {
  return prisma.navigationItem.findMany({ orderBy: { sortOrder: 'asc' } });
}

export function createNavItem(prisma: PrismaClient, input: CreateNavItemInput) {
  return prisma.navigationItem.create({ data: input });
}

export function updateNavItem(prisma: PrismaClient, id: number, input: UpdateNavItemInput) {
  return prisma.navigationItem.update({ where: { id }, data: input });
}

export function deleteNavItem(prisma: PrismaClient, id: number) {
  return prisma.navigationItem.delete({ where: { id } });
}

export async function reorderNavItems(prisma: PrismaClient, items: { id: number; sortOrder: number }[]) {
  await prisma.$transaction(
    items.map((item) => prisma.navigationItem.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })),
  );
}
