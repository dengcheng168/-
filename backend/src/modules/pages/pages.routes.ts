import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import { publicDetailHandler, adminListHandler, adminDetailHandler, adminUpdateHandler } from './pages.controller.js';

export async function publicPageRoutes(app: FastifyInstance) {
  app.get('/pages/:slug', publicDetailHandler);
}

export async function adminPageRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/pages', adminListHandler);
  app.get('/pages/:slug', adminDetailHandler);
  app.patch('/pages/:slug', adminUpdateHandler);
}
