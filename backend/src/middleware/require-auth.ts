import type { FastifyReply, FastifyRequest } from 'fastify';
import { fail } from '../lib/api-response.js';
import { COOKIE_NAME, PERMISSION_VERSION } from '../config/constants.js';

/**
 * 登录校验。除了验证 JWT 签名，还会用数据库里的当前状态覆盖/校验 JWT 签发时的快照：
 * - pv（权限模型版本号）跟当前常量不一致 → 权限模型变了，强制重新登录，不会用旧角色兜底放行
 * - 账号不存在或已停用 → 立即拒绝（不用等 7 天 Cookie 自然过期）
 * - sessionVersion 跟数据库当前值不一致 → 说明超级管理员点过"强制下线"，拒绝
 * - 校验通过后用数据库当前角色覆盖 request.user.role，保证改角色后不需要重新登录就能立即生效
 *   （生效方向是"立刻收紧或放宽"，不依赖 JWT 里可能过期的角色声明）
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send(fail('未登录或登录已过期，请重新登录', 'UNAUTHORIZED'));
  }

  if (request.user.pv !== PERMISSION_VERSION) {
    reply.clearCookie(COOKIE_NAME, { path: '/' });
    return reply.status(401).send(fail('系统权限模型已更新，请重新登录', 'PERMISSION_VERSION_MISMATCH'));
  }

  const user = await request.server.prisma.adminUser.findUnique({
    where: { id: request.user.sub },
    select: { isActive: true, role: true, sessionVersion: true },
  });

  if (!user || !user.isActive) {
    reply.clearCookie(COOKIE_NAME, { path: '/' });
    return reply.status(401).send(fail('账号不存在或已被禁用', 'UNAUTHORIZED'));
  }

  if (user.sessionVersion !== request.user.sv) {
    reply.clearCookie(COOKIE_NAME, { path: '/' });
    return reply.status(401).send(fail('登录状态已失效，请重新登录', 'SESSION_REVOKED'));
  }

  request.user.role = user.role;
}
