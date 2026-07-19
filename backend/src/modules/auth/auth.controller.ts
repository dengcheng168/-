import type { FastifyReply, FastifyRequest } from 'fastify';
import { isProduction } from '../../config/env.js';
import { COOKIE_NAME, COOKIE_MAX_AGE_SECONDS } from '../../config/constants.js';
import { ok, fail } from '../../lib/api-response.js';
import { loginSchema } from './auth.schema.js';
import {
  authenticateAdmin,
  touchLastLogin,
  getAdminById,
  isLoginLocked,
  recordLoginAttempt,
  LOGIN_LOCKOUT_WINDOW_MINUTES,
} from './auth.service.js';

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = loginSchema.parse(request.body);
  const ipAddress = request.ip;
  const userAgent = request.headers['user-agent'];

  if (await isLoginLocked(request.server.prisma, email)) {
    await recordLoginAttempt(request.server.prisma, { email, success: false, reason: 'LOCKED', ipAddress, userAgent });
    return reply
      .status(429)
      .send(fail(`登录失败次数过多，账号已临时锁定，请 ${LOGIN_LOCKOUT_WINDOW_MINUTES} 分钟后重试`, 'LOCKED'));
  }

  const user = await authenticateAdmin(request.server.prisma, email, password);
  if (!user) {
    await recordLoginAttempt(request.server.prisma, {
      email,
      success: false,
      reason: 'INVALID_CREDENTIALS',
      ipAddress,
      userAgent,
    });
    return reply.status(401).send(fail('邮箱或密码不正确', 'INVALID_CREDENTIALS'));
  }

  await recordLoginAttempt(request.server.prisma, { email, success: true, ipAddress, userAgent });
  await touchLastLogin(request.server.prisma, user.id);

  const token = await reply.jwtSign({ sub: user.id, email: user.email, role: user.role });

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

export async function logoutHandler(_request: FastifyRequest, reply: FastifyReply) {
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
