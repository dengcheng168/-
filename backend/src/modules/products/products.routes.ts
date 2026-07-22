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
  adminUpdateStatusHandler,
  adminToggleFeaturedHandler,
  adminReorderHandler,
  adminBulkStatusHandler,
  adminGetTranslationHandler,
  adminUpsertTranslationHandler,
} from './products.controller.js';

export async function publicProductRoutes(app: FastifyInstance) {
  app.get('/products', publicListHandler);
  app.get('/products/:slug', publicDetailHandler);
}

export async function adminProductRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/products', adminListHandler);
  app.post('/products', adminCreateHandler);
  app.get('/products/:id', adminDetailHandler);
  app.patch('/products/:id', adminUpdateHandler);
  app.delete('/products/:id', adminDeleteHandler);
  app.patch('/products/:id/status', adminUpdateStatusHandler);
  app.patch('/products/:id/featured', adminToggleFeaturedHandler);
  app.post('/products/reorder', adminReorderHandler);
  app.post('/products/bulk-status', adminBulkStatusHandler);
  app.get('/products/:id/translations/:locale', adminGetTranslationHandler);
  app.patch('/products/:id/translations/:locale', adminUpsertTranslationHandler);
}
