import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { toSkipTake, buildPaginationMeta } from '../../lib/pagination.js';
import { requireRole } from '../../middleware/require-role.js';
import { LOG_VIEW_ROLES } from '../../config/roles.js';

interface LoginLogQuery {
  email?: string;
  success?: string;
}

interface AuditLogQuery {
  adminEmail?: string;
  action?: string;
  entityType?: string;
  result?: string;
  from?: string;
  to?: string;
}

export async function adminAuditRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  // 登录记录/操作日志只有超级管理员能看——里面有其他管理员的登录 IP、失败原因等信息
  app.addHook('preHandler', requireRole(LOG_VIEW_ROLES));

  app.get('/login-logs', async (request: FastifyRequest<{ Querystring: LoginLogQuery }>) => {
    const query = paginationQuerySchema.parse(request.query);
    const where = {
      ...(request.query.email ? { email: { contains: request.query.email } } : {}),
      ...(request.query.success !== undefined ? { success: request.query.success === 'true' } : {}),
    };
    const [items, total] = await Promise.all([
      request.server.prisma.loginLog.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
      request.server.prisma.loginLog.count({ where }),
    ]);
    return ok(items, buildPaginationMeta(query, total));
  });

  // 操作日志只读——不提供任何修改/删除路由（见需求「操作日志只读，不提供后台修改和删除按钮」）
  app.get('/audit-logs', async (request: FastifyRequest<{ Querystring: AuditLogQuery }>) => {
    const query = paginationQuerySchema.parse(request.query);
    const { adminEmail, action, entityType, result, from, to } = request.query;
    const where = {
      ...(adminEmail ? { adminEmail: { contains: adminEmail } } : {}),
      ...(action ? { action: { contains: action } } : {}),
      ...(entityType ? { entityType } : {}),
      ...(result ? { result } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      request.server.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
      request.server.prisma.auditLog.count({ where }),
    ]);
    return ok(items, buildPaginationMeta(query, total));
  });
}
