import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import { adminListHandler, adminCreateHandler, adminUpdateHandler, adminDeleteHandler } from './redirects.controller.js';

export async function adminRedirectRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/redirects', adminListHandler);
  app.post('/redirects', adminCreateHandler);
  app.patch('/redirects/:id', adminUpdateHandler);
  app.delete('/redirects/:id', adminDeleteHandler);
}
