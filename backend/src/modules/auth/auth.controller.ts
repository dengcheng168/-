import type { FastifyReply, FastifyRequest } from 'fastify';
import { isProduction } from '../../config/env.js';
import { COOKIE_NAME, COOKIE_MAX_AGE_SECONDS, PERMISSION_VERSION } from '../../config/constants.js';
import { ok, fail } from '../../lib/api-response.js';
import { auditLog } from '../../lib/audit-log.js';
import { loginSchema } from './auth.schema.js';
import { authenticateAdmin, touchLastLogin, getAdminById, checkLoginLock, recordLoginAttempt } from './auth.service.js';

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = loginSchema.parse(request.body);
  const ipAddress = request.ip;
  const userAgent = request.headers['user-agent'];

  const lock = await checkLoginLock(request.server.prisma, email, ipAddress);
  if (lock.locked) {
    await recordLoginAttempt(request.server.prisma, { email, success: false, reason: lock.reason, ipAddress, userAgent });
    await auditLog(request.server.prisma, {
      actorEmail: email,
      action: 'auth.login_failure',
      resourceType: 'admin_user',
      summary: `${email} 登录被锁定（${lock.reason}）`,
      result: 'FAILURE',
      ipAddress,
      userAgent,
    });
    return reply.status(429).send(fail('登录失败次数过多，账号已临时锁定，请稍后再试', 'LOCKED'));
  }

  const { user, reason } = await authenticateAdmin(request.server.prisma, email, password);
  if (!user) {
    await recordLoginAttempt(request.server.prisma, { email, success: false, reason, ipAddress, userAgent });
    await auditLog(request.server.prisma, {
      actorEmail: email,
      action: 'auth.login_failure',
      resourceType: 'admin_user',
      summary: `${email} 登录失败`,
      result: 'FAILURE',
      ipAddress,
      userAgent,
    });
    // 邮箱不存在 / 密码错误 / 账号已停用，统一返回同一句话和同一状态码，
    // 不能让攻击者通过响应内容判断这个邮箱到底是不是真实管理员账号。
    return reply.status(401).send(fail('邮箱或密码不正确', 'INVALID_CREDENTIALS'));
  }

  await recordLoginAttempt(request.server.prisma, { email, success: true, ipAddress, userAgent });
  await touchLastLogin(request.server.prisma, user.id);
  await auditLog(request.server.prisma, {
    actorId: user.id,
    actorRole: user.role,
    action: 'auth.login_success',
    resourceType: 'admin_user',
    resourceId: user.id,
    summary: `${user.email} 登录成功`,
    result: 'SUCCESS',
    ipAddress,
    userAgent,
  });

  const token = await reply.jwtSign({ sub: user.id, email: user.email, role: user.role, pv: PERMISSION_VERSION, sv: user.sessionVersion });

  reply.setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  // token 也放进响应体：Next.js 后台前端与本后端是不同源（尤其本地开发时 3000/4000 端口不同），
  // 浏览器直接调用本接口拿到的 Cookie 无法被 Next.js 服务端读取，
  // 因此 Next.js 侧的登录 Server Action 会改用这里返回的 token 自行在前端域下种下同名 Cookie。
  return ok({ id: user.id, email: user.email, name: user.name, role: user.role, token });
}

export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
  // 退出登录不挂 requireAuth——就算 Session 已经失效/过期，也应该允许清掉这个坏掉的 Cookie，
  // 不能因为鉴权失败反而把用户卡在"退不出登录"的状态。这里只是"尽量"解出身份来记审计日志。
  try {
    await request.jwtVerify();
    await auditLog(request.server.prisma, {
      actorId: request.user.sub,
      actorRole: request.user.role,
      action: 'auth.logout',
      resourceType: 'admin_user',
      resourceId: request.user.sub,
      summary: `${request.user.email} 退出登录`,
      result: 'SUCCESS',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
  } catch {
    // token 缺失/已过期/签名无效，跳过审计日志，仍然正常清 Cookie
  }
  reply.clearCookie(COOKIE_NAME, { path: '/' });
  return ok({ loggedOut: true });
}

export async function meHandler(request: FastifyRequest, reply: FastifyReply) {
  const payload = request.user;
  const user = await getAdminById(request.server.prisma, payload.sub);

  if (!user || !user.isActive) {
    reply.clearCookie(COOKIE_NAME, { path: '/' });
    return reply.status(401).send(fail('账号不存在或已被禁用', 'UNAUTHORIZED'));
  }

  return ok(user);
}
