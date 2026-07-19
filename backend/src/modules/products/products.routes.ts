import type { FastifyInstance } from 'fastify';
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
} from './products.controller.js';

export async function publicProductRoutes(app: FastifyInstance) {
  app.get('/products', publicListHandler);
  app.get('/products/:slug', publicDetailHandler);
}

export async function adminProductRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/products', adminListHandler);
  app.post('/products', adminCreateHandler);
  app.get('/products/:id', adminDetailHandler);
  app.patch('/products/:id', adminUpdateHandler);
  app.delete('/products/:id', adminDeleteHandler);
  app.patch('/products/:id/status', adminUpdateStatusHandler);
  app.patch('/products/:id/featured', adminToggleFeaturedHandler);
  app.post('/products/reorder', adminReorderHandler);
  app.post('/products/bulk-status', adminBulkStatusHandler);
}
