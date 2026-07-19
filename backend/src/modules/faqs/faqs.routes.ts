import type { FastifyInstance } from 'fastify';
import {
  publicListHandler,
  adminListHandler,
  adminDetailHandler,
  adminCreateHandler,
  adminUpdateHandler,
  adminDeleteHandler,
  adminReorderHandler,
} from './faqs.controller.js';

export async function publicFaqRoutes(app: FastifyInstance) {
  app.get('/faqs', publicListHandler);
}

export async function adminFaqRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/faqs', adminListHandler);
  app.post('/faqs', adminCreateHandler);
  app.get('/faqs/:id', adminDetailHandler);
  app.patch('/faqs/:id', adminUpdateHandler);
  app.delete('/faqs/:id', adminDeleteHandler);
  app.post('/faqs/reorder', adminReorderHandler);
}
