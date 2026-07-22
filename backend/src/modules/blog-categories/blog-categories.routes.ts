import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import {
  publicListHandler,
  adminListHandler,
  adminDetailHandler,
  adminCreateHandler,
  adminUpdateHandler,
  adminDeleteHandler,
  adminGetTranslationHandler,
  adminUpsertTranslationHandler,
} from './blog-categories.controller.js';

export async function publicBlogCategoryRoutes(app: FastifyInstance) {
  app.get('/blog-categories', publicListHandler);
}

export async function adminBlogCategoryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/blog-categories', adminListHandler);
  app.post('/blog-categories', adminCreateHandler);
  app.get('/blog-categories/:id', adminDetailHandler);
  app.patch('/blog-categories/:id', adminUpdateHandler);
  app.delete('/blog-categories/:id', adminDeleteHandler);
  app.get('/blog-categories/:id/translations/:locale', adminGetTranslationHandler);
  app.patch('/blog-categories/:id/translations/:locale', adminUpsertTranslationHandler);
}
