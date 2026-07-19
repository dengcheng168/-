import type { FastifyInstance } from 'fastify';
import {
  publicListHandler,
  adminListHandler,
  adminDetailHandler,
  adminCreateHandler,
  adminUpdateHandler,
  adminDeleteHandler,
  adminReorderHandler,
} from './testimonials.controller.js';

export async function publicTestimonialRoutes(app: FastifyInstance) {
  app.get('/testimonials', publicListHandler);
}

export async function adminTestimonialRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/testimonials', adminListHandler);
  app.post('/testimonials', adminCreateHandler);
  app.get('/testimonials/:id', adminDetailHandler);
  app.patch('/testimonials/:id', adminUpdateHandler);
  app.delete('/testimonials/:id', adminDeleteHandler);
  app.post('/testimonials/reorder', adminReorderHandler);
}
