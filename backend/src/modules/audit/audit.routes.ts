import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { toSkipTake, buildPaginationMeta } from '../../lib/pagination.js';
import { requireRole } from '../../middleware/require-role.js';

export async function adminAuditRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  // 登录记录/操作日志只有超级管理员能看——里面有其他管理员的登录 IP、失败原因等信息
  app.addHook('preHandler', requireRole(['SUPER_ADMIN']));

  app.get('/login-logs', async (request: FastifyRequest) => {
    const query = paginationQuerySchema.parse(request.query);
    const [items, total] = await Promise.all([
      request.server.prisma.loginLog.findMany({ orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
      request.server.prisma.loginLog.count(),
    ]);
    return ok(items, buildPaginationMeta(query, total));
  });

  app.get('/audit-logs', async (request: FastifyRequest) => {
    const query = paginationQuerySchema.parse(request.query);
    const [items, total] = await Promise.all([
      request.server.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
      request.server.prisma.auditLog.count(),
    ]);
    return ok(items, buildPaginationMeta(query, total));
  });
}
