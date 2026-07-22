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
  adminGetTranslationHandler,
  adminUpsertTranslationHandler,
} from './blog.controller.js';

export async function publicBlogRoutes(app: FastifyInstance) {
  app.get('/blog', publicListHandler);
  app.get('/blog/:slug', publicDetailHandler);
}

export async function adminBlogRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/blog', adminListHandler);
  app.post('/blog', adminCreateHandler);
  app.get('/blog/:id', adminDetailHandler);
  app.patch('/blog/:id', adminUpdateHandler);
  app.delete('/blog/:id', adminDeleteHandler);
  app.patch('/blog/:id/status', adminUpdateStatusHandler);
  app.get('/blog/:id/translations/:locale', adminGetTranslationHandler);
  app.patch('/blog/:id/translations/:locale', adminUpsertTranslationHandler);
}
