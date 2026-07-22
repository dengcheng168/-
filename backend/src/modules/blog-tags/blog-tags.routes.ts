import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import { publicListHandler, adminListHandler, adminCreateHandler, adminDeleteHandler } from './blog-tags.controller.js';

export async function publicBlogTagRoutes(app: FastifyInstance) {
  app.get('/blog-tags', publicListHandler);
}

export async function adminBlogTagRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/blog-tags', adminListHandler);
  app.post('/blog-tags', adminCreateHandler);
  app.delete('/blog-tags/:id', adminDeleteHandler);
}
