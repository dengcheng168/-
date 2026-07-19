import type { FastifyInstance } from 'fastify';
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

  app.get('/navigation', adminListHandler);
  app.post('/navigation', adminCreateHandler);
  app.patch('/navigation/:id', adminUpdateHandler);
  app.delete('/navigation/:id', adminDeleteHandler);
  app.post('/navigation/reorder', adminReorderHandler);
}
