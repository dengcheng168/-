import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import {
  adminUploadHandler,
  adminBatchUploadHandler,
  adminListHandler,
  adminUnusedListHandler,
  adminUpdateHandler,
  adminUsageHandler,
  adminDeleteHandler,
} from './media.controller.js';

export async function adminMediaRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/media', adminListHandler);
  app.get('/media/unused', adminUnusedListHandler);
  app.post('/media/upload', adminUploadHandler);
  app.post('/media/upload-batch', adminBatchUploadHandler);
  app.patch('/media/:id', adminUpdateHandler);
  app.get('/media/:id/usage', adminUsageHandler);
  app.delete('/media/:id', adminDeleteHandler);
}
