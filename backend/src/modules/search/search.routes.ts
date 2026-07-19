import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { serializeProduct } from '../products/products.service.js';

export async function publicSearchRoutes(app: FastifyInstance) {
  app.get('/search', async (request: FastifyRequest<{ Querystring: { q?: string } }>) => {
    const q = (request.query.q ?? '').trim();
    if (!q) return ok({ products: [], posts: [] });

    const [products, posts] = await Promise.all([
      request.server.prisma.product.findMany({
        where: { status: 'PUBLISHED', deletedAt: null, name: { contains: q } },
        take: 20,
        orderBy: { sortOrder: 'asc' },
      }),
      request.server.prisma.blogPost.findMany({
        where: { status: 'PUBLISHED', deletedAt: null, title: { contains: q } },
        take: 20,
        orderBy: { publishedAt: 'desc' },
      }),
    ]);

    return ok({ products: products.map(serializeProduct), posts });
  });
}
