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
    errorResponseBuilder: () => fail('请求过于频繁，请稍后再试', 'RATE_LIMITED'),
  });
});
