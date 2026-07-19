import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import { listBlogTags, createBlogTag, deleteBlogTag } from './blog-tags.service.js';
import { createBlogTagSchema } from './blog-tags.schema.js';

export async function publicBlogTagRoutes(app: FastifyInstance) {
  app.get('/blog-tags', async (request) => ok(await listBlogTags(request.server.prisma)));
}

export async function adminBlogTagRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/blog-tags', async (request) => ok(await listBlogTags(request.server.prisma)));

  app.post('/blog-tags', async (request: FastifyRequest) => {
    const input = createBlogTagSchema.parse(request.body);
    return ok(await createBlogTag(request.server.prisma, input));
  });

  app.delete('/blog-tags/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    await deleteBlogTag(request.server.prisma, Number(request.params.id));
    return ok({ deleted: true });
  });
}
