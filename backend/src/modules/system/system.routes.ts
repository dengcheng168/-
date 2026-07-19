import type { FastifyInstance } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { isProduction } from '../../config/env.js';

export async function adminSystemRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/system/info', async (request) => {
    const [productCount, postCount, inquiryCount, mediaCount] = await Promise.all([
      request.server.prisma.product.count(),
      request.server.prisma.blogPost.count(),
      request.server.prisma.inquiry.count(),
      request.server.prisma.media.count(),
    ]);

    return ok({
      nodeVersion: process.version,
      environment: isProduction ? 'production' : 'development',
      uptimeSeconds: Math.round(process.uptime()),
      databaseProvider: 'sqlite',
      counts: { products: productCount, blogPosts: postCount, inquiries: inquiryCount, media: mediaCount },
      serverTime: new Date().toISOString(),
    });
  });
}
