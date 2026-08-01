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
} from './factory-gallery.controller.js';

export async function publicFactoryGalleryRoutes(app: FastifyInstance) {
  app.get('/factory-gallery', publicListHandler);
}

export async function adminFactoryGalleryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/factory-gallery', adminListHandler);
  app.post('/factory-gallery', adminCreateHandler);
  app.get('/factory-gallery/:id', adminDetailHandler);
  app.patch('/factory-gallery/:id', adminUpdateHandler);
  app.delete('/factory-gallery/:id', adminDeleteHandler);
  app.post('/factory-gallery/reorder', adminReorderHandler);
  app.get('/factory-gallery/:id/translations/:locale', adminGetTranslationHandler);
  app.patch('/factory-gallery/:id/translations/:locale', adminUpsertTranslationHandler);
}
