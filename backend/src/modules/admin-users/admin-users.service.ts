import type { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../lib/password.js';
import { getRecentFailureCount, LOCKOUT_THRESHOLDS } from '../auth/auth.service.js';
import type { CreateAdminUserInput, UpdateAdminUserInput } from './admin-users.schema.js';

export class LastSuperAdminError extends Error {}
export class SelfDeactivationError extends Error {}

const ADMIN_LIST_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  unlockedAt: true,
  createdAt: true,
} as const;

async function withLockStatus<T extends { email: string }>(prisma: PrismaClient, user: T) {
  const recentFailureCount = await getRecentFailureCount(prisma, user.email);
  return {
    ...user,
    recentFailureCount,
    locked: recentFailureCount >= LOCKOUT_THRESHOLDS.EMAIL_IP_THRESHOLD,
  };
}

export async function listAdminUsers(prisma: PrismaClient) {
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' }, select: ADMIN_LIST_SELECT });
  return Promise.all(users.map((u) => withLockStatus(prisma, u)));
}

export async function getAdminUserById(prisma: PrismaClient, id: number) {
  const user = await prisma.adminUser.findUnique({ where: { id }, select: ADMIN_LIST_SELECT });
  if (!user) return null;
  return withLockStatus(prisma, user);
}

export async function createAdminUser(prisma: PrismaClient, input: CreateAdminUserInput) {
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.adminUser.create({
    data: { email: input.email, passwordHash, name: input.name, role: input.role },
    select: ADMIN_LIST_SELECT,
  });
  return user;
}

async function countOtherActiveSuperAdmins(prisma: PrismaClient, excludeId: number): Promise<number> {
  return prisma.adminUser.count({ where: { role: 'SUPER_ADMIN', isActive: true, id: { not: excludeId } } });
}

export async function updateAdminUser(
  prisma: PrismaClient,
  id: number,
  input: UpdateAdminUserInput,
  actorId: number,
) {
  const existing = await prisma.adminUser.findUnique({ where: { id }, select: ADMIN_LIST_SELECT });
  if (!existing) return null;

  // 超级管理员不能通过这个接口误停用自己当前登录的账号，即便还有其他超级管理员在——
  // 这是防误操作，跟"是否最后一个超级管理员"是两条独立的规则。
  if (id === actorId && input.isActive === false) {
    throw new SelfDeactivationError('不能停用当前登录的账号本身');
  }

  const willBeSuperAdmin = (input.role ?? existing.role) === 'SUPER_ADMIN';
  const willBeActive = input.isActive ?? existing.isActive;
  const wasActiveSuperAdmin = existing.role === 'SUPER_ADMIN' && existing.isActive;
  const stillActiveSuperAdmin = willBeSuperAdmin && willBeActive;

  if (wasActiveSuperAdmin && !stillActiveSuperAdmin) {
    const others = await countOtherActiveSuperAdmins(prisma, id);
    if (others === 0) {
      throw new LastSuperAdminError('不能停用或修改最后一个超级管理员的角色/启用状态');
    }
  }

  const user = await prisma.adminUser.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    select: ADMIN_LIST_SELECT,
  });

  return { before: existing, after: user };
}

export async function resetAdminPassword(prisma: PrismaClient, id: number, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  // 重置密码顺带把 sessionVersion 加一，强制所有已有登录状态失效——密码都被重置了，
  // 旧 Session（如果是账号被盗用触发的重置）不应该继续有效。
  const user = await prisma.adminUser.update({
    where: { id },
    data: { passwordHash, sessionVersion: { increment: 1 } },
    select: ADMIN_LIST_SELECT,
  });
  return user;
}

export async function unlockAdminUser(prisma: PrismaClient, id: number) {
  const user = await prisma.adminUser.update({ where: { id }, data: { unlockedAt: new Date() }, select: ADMIN_LIST_SELECT });
  return withLockStatus(prisma, user);
}

export async function revokeAdminSessions(prisma: PrismaClient, id: number) {
  const user = await prisma.adminUser.update({
    where: { id },
    data: { sessionVersion: { increment: 1 } },
    select: ADMIN_LIST_SELECT,
  });
  return user;
}
