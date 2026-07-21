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
} from './certificates.controller.js';

export async function publicCertificateRoutes(app: FastifyInstance) {
  app.get('/certificates', publicListHandler);
}

export async function adminCertificateRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/certificates', adminListHandler);
  app.post('/certificates', adminCreateHandler);
  app.get('/certificates/:id', adminDetailHandler);
  app.patch('/certificates/:id', adminUpdateHandler);
  app.delete('/certificates/:id', adminDeleteHandler);
  app.post('/certificates/reorder', adminReorderHandler);
  app.get('/certificates/:id/translations/:locale', adminGetTranslationHandler);
  app.patch('/certificates/:id/translations/:locale', adminUpsertTranslationHandler);
}
