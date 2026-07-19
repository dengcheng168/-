import type { FastifyInstance } from 'fastify';
import {
  publicListHandler,
  adminListHandler,
  adminDetailHandler,
  adminCreateHandler,
  adminUpdateHandler,
  adminDeleteHandler,
  adminReorderHandler,
} from './certificates.controller.js';

export async function publicCertificateRoutes(app: FastifyInstance) {
  app.get('/certificates', publicListHandler);
}

export async function adminCertificateRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/certificates', adminListHandler);
  app.post('/certificates', adminCreateHandler);
  app.get('/certificates/:id', adminDetailHandler);
  app.patch('/certificates/:id', adminUpdateHandler);
  app.delete('/certificates/:id', adminDeleteHandler);
  app.post('/certificates/reorder', adminReorderHandler);
}
