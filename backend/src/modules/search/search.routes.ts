import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { serializeProduct, attachProductTranslations } from '../products/products.service.js';
import { attachPostTranslations } from '../blog/blog.service.js';
import { z } from 'zod';

const searchQuerySchema = z.object({ q: z.string().max(200).default(''), locale: z.enum(['es']).optional() });

export async function publicSearchRoutes(app: FastifyInstance) {
  app.get('/search', async (request: FastifyRequest<{ Querystring: { q?: string } }>) => {
    const query = searchQuerySchema.parse(request.query);
    const q = query.q.trim();
    const locale = query.locale;
    if (!q) return ok({ products: [], posts: [] });

    const [products, posts] = await Promise.all([
      request.server.prisma.product.findMany({
        where: { status: 'PUBLISHED', deletedAt: null, OR: [
          { name: { contains: q } },
          ...(locale ? [{ translations: { some: { locale, translationStatus: 'PUBLISHED', name: { contains: q } } } }] : []),
        ] },
        take: 20,
        orderBy: { sortOrder: 'asc' },
      }),
      request.server.prisma.blogPost.findMany({
        where: { status: 'PUBLISHED', deletedAt: null, OR: [
          { title: { contains: q } },
          ...(locale ? [{ translations: { some: { locale, translationStatus: 'PUBLISHED', title: { contains: q } } } }] : []),
        ] },
        take: 20,
        orderBy: { publishedAt: 'desc' },
      }),
    ]);

    const [localizedProducts, localizedPosts] = await Promise.all([
      attachProductTranslations(request.server.prisma, products.map(serializeProduct), locale),
      attachPostTranslations(request.server.prisma, posts, locale),
    ]);
    return ok({ products: localizedProducts, posts: localizedPosts });
  });
}
