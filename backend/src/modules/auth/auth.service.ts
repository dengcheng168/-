import type { PrismaClient } from '@prisma/client';
import { verifyPassword } from '../../lib/password.js';

const LOCKOUT_WINDOW_MINUTES = 15;
const LOCKOUT_MAX_FAILURES = 5;

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

/** 最近 15 分钟内这个邮箱的失败尝试是否已达到 5 次（登录失败次数限制，见需求文档「三、后台登录和权限」） */
export async function isLoginLocked(prisma: PrismaClient, email: string): Promise<boolean> {
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000);
  const recentFailures = await prisma.loginLog.count({
    where: { email, success: false, createdAt: { gte: since } },
  });
  return recentFailures >= LOCKOUT_MAX_FAILURES;
}

export function recordLoginAttempt(
  prisma: PrismaClient,
  entry: { email: string; success: boolean; reason?: string; ipAddress?: string; userAgent?: string },
): Promise<unknown> {
  return prisma.loginLog.create({ data: entry }).catch(() => undefined);
}

export const LOGIN_LOCKOUT_WINDOW_MINUTES = LOCKOUT_WINDOW_MINUTES;
