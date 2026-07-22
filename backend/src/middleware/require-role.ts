import type { FastifyReply, FastifyRequest } from 'fastify';
import { fail } from '../lib/api-response.js';
import type { AdminRole } from '../config/roles.js';

/**
 * 角色校验必须在服务端做，不能只在后台前端隐藏按钮（见需求文档「三、后台登录和权限」）。
 * 必须排在 app.authenticate 之后使用，依赖 request.user.role 已经由 JWT 校验populate。
 */
export function requireRole(allowed: AdminRole[]) {
  return async function requireRoleHandler(request: FastifyRequest, reply: FastifyReply) {
    const role = request.user?.role as AdminRole | undefined;
    if (!role || !allowed.includes(role)) {
      return reply.status(403).send(fail('没有权限执行此操作', 'FORBIDDEN'));
    }
  };
}
