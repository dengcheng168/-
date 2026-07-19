import type { FastifyReply, FastifyRequest } from 'fastify';
import { fail } from '../lib/api-response.js';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send(fail('未登录或登录已过期，请重新登录', 'UNAUTHORIZED'));
  }
}
