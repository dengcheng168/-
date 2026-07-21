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
  adminReorderHandler,
  adminGetTranslationHandler,
  adminUpsertTranslationHandler,
} from './faqs.controller.js';

export async function publicFaqRoutes(app: FastifyInstance) {
  app.get('/faqs', publicListHandler);
}

export async function adminFaqRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/faqs', adminListHandler);
  app.post('/faqs', adminCreateHandler);
  app.get('/faqs/:id', adminDetailHandler);
  app.patch('/faqs/:id', adminUpdateHandler);
  app.delete('/faqs/:id', adminDeleteHandler);
  app.post('/faqs/reorder', adminReorderHandler);
  app.get('/faqs/:id/translations/:locale', adminGetTranslationHandler);
  app.patch('/faqs/:id/translations/:locale', adminUpsertTranslationHandler);
}
