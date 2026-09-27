import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import { adminListHandler, adminCreateHandler, adminUpdateHandler, adminDeleteHandler } from './redirects.controller.js';
import { ok } from '../../lib/api-response.js';
import { resolvePublicRedirect, resolvePublicRedirectBatch } from './redirects.service.js';
import { isRedirectPath } from './redirect-path.js';
import { z } from 'zod';

export async function publicRedirectRoutes(app: FastifyInstance) {
  app.post('/redirects/resolve-batch', { bodyLimit: 512 * 1024 }, async (request) => {
    const { paths } = z.object({
      paths: z.array(z.string().max(2048).refine(isRedirectPath)).min(1).max(200),
    }).strict().parse(request.body);
    return ok(await resolvePublicRedirectBatch(app.prisma, paths));
  });
  app.get('/redirects/resolve', async (request) => {
    const { path } = z.object({ path: z.string().max(2048) }).parse(request.query);
    return ok(await resolvePublicRedirect(app.prisma, path));
  });
}

export async function adminRedirectRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/redirects', adminListHandler);
  app.post('/redirects', adminCreateHandler);
  app.patch('/redirects/:id', adminUpdateHandler);
  app.delete('/redirects/:id', adminDeleteHandler);
}
