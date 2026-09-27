import rateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { fail } from '../lib/api-response.js';

function isPrivateOrLoopbackAddress(address: string): boolean {
  const normalized = address.startsWith('::ffff:') ? address.slice(7) : address;

  if (normalized === '::1' || normalized === '127.0.0.1') return true;

  const parts = normalized.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:');
  }

  const first = parts[0]!;
  const second = parts[1]!;
  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

/**
 * Next.js performs public SSR reads over the private Docker network. Those
 * requests otherwise all share the frontend container IP and exhaust one
 * global bucket during a crawler pass, producing false 404/500 pages.
 *
 * Only private-network read traffic is exempt. Authentication, inquiries,
 * analytics writes, admin mutations and every public-origin request retain
 * their normal per-IP limits. The redirect batch endpoint is the sole POST
 * exception because it is an idempotent read used while rendering navigation.
 */
export function isTrustedInternalRead(request: FastifyRequest): boolean {
  if (!isPrivateOrLoopbackAddress(request.ip)) return false;

  const method = request.method.toUpperCase();
  const path = request.url.split('?', 1)[0] ?? '';
  if (method === 'GET' || method === 'HEAD') {
    return (
      path.startsWith('/api/') &&
      !path.startsWith('/api/admin/') &&
      !path.startsWith('/api/auth/')
    );
  }

  return method === 'POST' && path === '/api/redirects/resolve-batch';
}

export default fp(async function rateLimitPlugin(app: FastifyInstance) {
  // 全局默认限流，登录/询盘等敏感接口会在各自路由用 config.rateLimit 覆盖为更严格的值
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    allowList: (request) => isTrustedInternalRead(request),
    // @fastify/rate-limit 会把这个函数的返回值直接 throw 出去，交给全局错误处理器处理；
    // 默认实现会给错误对象挂上 statusCode=429，我们自定义的返回值必须自己带上这个字段，
    // 否则全局错误处理器读不到 statusCode，会把它当成 500 处理（曾经复现过这个 bug）。
    errorResponseBuilder: (_request, context) =>
      Object.assign(fail('请求过于频繁，请稍后再试', 'RATE_LIMITED'), { statusCode: context.statusCode }),
  });
});
