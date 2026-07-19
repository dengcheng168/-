import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import { listAdminRedirects, createRedirect, updateRedirect, deleteRedirect } from './redirects.service.js';
import { createRedirectSchema, updateRedirectSchema } from './redirects.schema.js';

export async function adminRedirectRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/redirects', async (request: FastifyRequest) => {
    const query = paginationQuerySchema.parse(request.query);
    const { items, meta } = await listAdminRedirects(request.server.prisma, query);
    return ok(items, meta);
  });

  app.post('/redirects', async (request: FastifyRequest) => {
    return ok(await createRedirect(request.server.prisma, createRedirectSchema.parse(request.body)));
  });

  app.patch('/redirects/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const input = updateRedirectSchema.parse(request.body);
    return ok(await updateRedirect(request.server.prisma, Number(request.params.id), input));
  });

  app.delete('/redirects/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    await deleteRedirect(request.server.prisma, Number(request.params.id));
    return ok({ deleted: true });
  });
}
