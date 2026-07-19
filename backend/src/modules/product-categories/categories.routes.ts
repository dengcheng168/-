import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import {
  publicListHandler,
  publicDetailHandler,
  adminListHandler,
  adminDetailHandler,
  adminCreateHandler,
  adminUpdateHandler,
  adminDeleteHandler,
  adminReorderHandler,
} from './categories.controller.js';

export async function publicCategoryRoutes(app: FastifyInstance) {
  app.get('/product-categories', publicListHandler);
  app.get('/product-categories/:slug', publicDetailHandler);
}

export async function adminCategoryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/product-categories', adminListHandler);
  app.post('/product-categories', adminCreateHandler);
  app.get('/product-categories/:id', adminDetailHandler);
  app.patch('/product-categories/:id', adminUpdateHandler);
  app.delete('/product-categories/:id', adminDeleteHandler);
  app.post('/product-categories/reorder', adminReorderHandler);
}
