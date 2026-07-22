import type { PrismaClient } from '@prisma/client';
import '@fastify/jwt';

export interface JwtUserPayload {
  sub: number;
  email: string;
  // JWT 里签发时快照的角色/版本号，requireAuth 只用它们做一次性校验（跟当前数据库对比），
  // 校验通过后会把 role 覆盖成数据库当前值——授权判断永远以数据库为准，不信任 JWT 里的角色声明。
  role: string;
  pv: number; // 权限模型版本号，见 config/constants.ts 的 PERMISSION_VERSION
  sv: number; // 该管理员的 sessionVersion 快照，用于"强制下线"
}

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUserPayload;
    user: JwtUserPayload;
  }
}
