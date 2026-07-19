import type { PrismaClient } from '@prisma/client';
import { verifyPassword } from '../../lib/password.js';

export async function authenticateAdmin(prisma: PrismaClient, email: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !user.isActive) return null;

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) return null;

  return user;
}

export async function touchLastLogin(prisma: PrismaClient, userId: number) {
  await prisma.adminUser.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
}

export async function getAdminById(prisma: PrismaClient, id: number) {
  return prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true },
  });
}
