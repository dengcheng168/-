import type { PrismaClient } from '@prisma/client';
import '@fastify/jwt';

export interface JwtUserPayload {
  sub: number;
  email: string;
  role: string;
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
