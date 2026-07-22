import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  listAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  resetAdminPassword,
  unlockAdminUser,
  revokeAdminSessions,
  LastSuperAdminError,
  SelfDeactivationError,
} from './admin-users.service.js';
import { createAdminUserSchema, updateAdminUserSchema, resetPasswordSchema } from './admin-users.schema.js';

export async function adminUserListHandler(request: FastifyRequest) {
  return ok(await listAdminUsers(request.server.prisma));
}

export async function adminUserDetailHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const user = await getAdminUserById(request.server.prisma, Number(request.params.id));
  if (!user) return reply.status(404).send(fail('管理员不存在', 'NOT_FOUND'));
  return ok(user);
}

export async function adminUserCreateHandler(request: FastifyRequest) {
  const input = createAdminUserSchema.parse(request.body);
  const user = await createAdminUser(request.server.prisma, input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'admin_user.create',
    resourceType: 'admin_user',
    resourceId: user.id,
    summary: `创建管理员 ${user.email}（角色：${user.role}）`,
    after: { email: user.email, name: user.name, role: user.role },
  });
  return ok(user);
}

export async function adminUserUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const input = updateAdminUserSchema.parse(request.body);
  const id = Number(request.params.id);

  try {
    const result = await updateAdminUser(request.server.prisma, id, input, request.user.sub);
    if (!result) return reply.status(404).send(fail('管理员不存在', 'NOT_FOUND'));

    const roleChanged = input.role !== undefined && input.role !== result.before.role;
    const activeChanged = input.isActive !== undefined && input.isActive !== result.before.isActive;

    await auditLogFromRequest(request.server.prisma, request, {
      action: roleChanged ? 'admin_user.role_change' : activeChanged ? 'admin_user.status_change' : 'admin_user.update',
      resourceType: 'admin_user',
      resourceId: id,
      summary: `修改管理员 ${result.after.email}${roleChanged ? `（角色 ${result.before.role} → ${result.after.role}）` : ''}${
        activeChanged ? `（${result.after.isActive ? '启用' : '停用'}）` : ''
      }`,
      before: { email: result.before.email, name: result.before.name, role: result.before.role, isActive: result.before.isActive },
      after: { email: result.after.email, name: result.after.name, role: result.after.role, isActive: result.after.isActive },
    });
    return ok(result.after);
  } catch (err) {
    if (err instanceof LastSuperAdminError || err instanceof SelfDeactivationError) {
      return reply.status(409).send(fail(err.message, 'LAST_SUPER_ADMIN_OR_SELF'));
    }
    throw err;
  }
}

export async function adminUserResetPasswordHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { newPassword } = resetPasswordSchema.parse(request.body);
  const id = Number(request.params.id);
  const user = await resetAdminPassword(request.server.prisma, id, newPassword).catch(() => null);
  if (!user) return reply.status(404).send(fail('管理员不存在', 'NOT_FOUND'));

  await auditLogFromRequest(request.server.prisma, request, {
    action: 'admin_user.password_reset',
    resourceType: 'admin_user',
    resourceId: id,
    summary: `重置管理员 ${user.email} 的密码`,
    // 不记录密码本身，也不记录密码哈希——只记录"发生过重置"这件事
  });
  return ok({ reset: true });
}

export async function adminUserUnlockHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const id = Number(request.params.id);
  const user = await unlockAdminUser(request.server.prisma, id).catch(() => null);
  if (!user) return reply.status(404).send(fail('管理员不存在', 'NOT_FOUND'));

  await auditLogFromRequest(request.server.prisma, request, {
    action: 'admin_user.unlock',
    resourceType: 'admin_user',
    resourceId: id,
    summary: `手动解除管理员 ${user.email} 的登录锁定`,
  });
  return ok(user);
}

export async function adminUserRevokeSessionsHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const id = Number(request.params.id);
  const user = await revokeAdminSessions(request.server.prisma, id).catch(() => null);
  if (!user) return reply.status(404).send(fail('管理员不存在', 'NOT_FOUND'));

  await auditLogFromRequest(request.server.prisma, request, {
    action: 'admin_user.revoke_sessions',
    resourceType: 'admin_user',
    resourceId: id,
    summary: `强制管理员 ${user.email} 的所有登录状态失效`,
  });
  return ok({ revoked: true });
}
