import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import { publicTranslationsHandler, adminListTranslationsHandler, adminUpsertTranslationsHandler } from './translations.controller.js';

export async function publicTranslationRoutes(app: FastifyInstance) {
  app.get('/translations/:locale', publicTranslationsHandler);
}

export async function adminTranslationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/translations', adminListTranslationsHandler);
  app.patch('/translations', adminUpsertTranslationsHandler);
}
