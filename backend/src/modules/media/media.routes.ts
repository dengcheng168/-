import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import {
  adminUploadHandler,
  adminListHandler,
  adminUpdateHandler,
  adminUsageHandler,
  adminDeleteHandler,
} from './media.controller.js';

export async function adminMediaRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/media', adminListHandler);
  app.post('/media/upload', adminUploadHandler);
  app.patch('/media/:id', adminUpdateHandler);
  app.get('/media/:id/usage', adminUsageHandler);
  app.delete('/media/:id', adminDeleteHandler);
}
