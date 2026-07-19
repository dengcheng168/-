import type { FastifyInstance } from 'fastify';
import { publicDetailHandler, adminListHandler, adminDetailHandler, adminUpdateHandler } from './pages.controller.js';

export async function publicPageRoutes(app: FastifyInstance) {
  app.get('/pages/:slug', publicDetailHandler);
}

export async function adminPageRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/pages', adminListHandler);
  app.get('/pages/:slug', adminDetailHandler);
  app.patch('/pages/:slug', adminUpdateHandler);
}
