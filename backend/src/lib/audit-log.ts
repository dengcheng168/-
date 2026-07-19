import type { PrismaClient } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

/**
 * 记录一条后台操作日志。故意"尽力而为"、不抛错——写日志失败不应该让真正的业务操作
 * （比如产品保存）跟着失败，只在服务器日志里记一条 error 方便排查。
 */
export async function recordAuditLog(
  prisma: PrismaClient,
  request: FastifyRequest,
  entry: { action: string; entityType: string; entityId?: string | number; summary: string },
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId: request.user?.sub,
        adminEmail: request.user?.email ?? 'unknown',
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId === undefined ? null : String(entry.entityId),
        summary: entry.summary,
        ipAddress: request.ip,
      },
    });
  } catch (err) {
    request.log.error({ err }, '写入操作日志失败');
  }
}
