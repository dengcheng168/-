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
} from './blog.controller.js';

export async function publicBlogRoutes(app: FastifyInstance) {
  app.get('/blog', publicListHandler);
  app.get('/blog/:slug', publicDetailHandler);
}

export async function adminBlogRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/blog', adminListHandler);
  app.post('/blog', adminCreateHandler);
  app.get('/blog/:id', adminDetailHandler);
  app.patch('/blog/:id', adminUpdateHandler);
  app.delete('/blog/:id', adminDeleteHandler);
  app.patch('/blog/:id/status', adminUpdateStatusHandler);
}
