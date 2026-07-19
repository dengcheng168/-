import type { FastifyInstance } from 'fastify';
import { ok } from '../../lib/api-response.js';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return ok({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });
}
