import rateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { fail } from '../lib/api-response.js';

export default fp(async function rateLimitPlugin(app: FastifyInstance) {
  // 全局默认限流，登录/询盘等敏感接口会在各自路由用 config.rateLimit 覆盖为更严格的值
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    // @fastify/rate-limit 会把这个函数的返回值直接 throw 出去，交给全局错误处理器处理；
    // 默认实现会给错误对象挂上 statusCode=429，我们自定义的返回值必须自己带上这个字段，
    // 否则全局错误处理器读不到 statusCode，会把它当成 500 处理（曾经复现过这个 bug）。
    errorResponseBuilder: (_request, context) =>
      Object.assign(fail('请求过于频繁，请稍后再试', 'RATE_LIMITED'), { statusCode: context.statusCode }),
  });
});
