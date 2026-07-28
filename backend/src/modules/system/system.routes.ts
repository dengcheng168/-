import type { FastifyInstance } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { isProduction } from '../../config/env.js';

export async function adminSystemRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/system/info', async (request) => {
    // Product/BlogPost 是软删除，不加 deletedAt: null 的话已删除的记录仍会被计入总数，
    // 跟列表页实际能看到的数量对不上（Inquiry/Media 没有 deletedAt 字段，不需要过滤）。
    const [productCount, postCount, inquiryCount, mediaCount] = await Promise.all([
      request.server.prisma.product.count({ where: { deletedAt: null } }),
      request.server.prisma.blogPost.count({ where: { deletedAt: null } }),
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
