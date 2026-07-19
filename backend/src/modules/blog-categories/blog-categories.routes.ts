import type { FastifyInstance } from 'fastify';
import {
  publicListHandler,
  adminListHandler,
  adminDetailHandler,
  adminCreateHandler,
  adminUpdateHandler,
  adminDeleteHandler,
} from './blog-categories.controller.js';

export async function publicBlogCategoryRoutes(app: FastifyInstance) {
  app.get('/blog-categories', publicListHandler);
}

export async function adminBlogCategoryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/blog-categories', adminListHandler);
  app.post('/blog-categories', adminCreateHandler);
  app.get('/blog-categories/:id', adminDetailHandler);
  app.patch('/blog-categories/:id', adminUpdateHandler);
  app.delete('/blog-categories/:id', adminDeleteHandler);
}
