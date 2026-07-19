import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import {
  publicListHandler,
  adminListHandler,
  adminCreateHandler,
  adminUpdateHandler,
  adminDeleteHandler,
  adminReorderHandler,
} from './navigation.controller.js';

export async function publicNavigationRoutes(app: FastifyInstance) {
  app.get('/navigation', publicListHandler);
}

export async function adminNavigationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/navigation', adminListHandler);
  app.post('/navigation', adminCreateHandler);
  app.patch('/navigation/:id', adminUpdateHandler);
  app.delete('/navigation/:id', adminDeleteHandler);
  app.post('/navigation/reorder', adminReorderHandler);
}
