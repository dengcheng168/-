import type { FastifyInstance } from 'fastify';
import { loginHandler, logoutHandler, meHandler } from './auth.controller.js';

export default async function authRoutes(app: FastifyInstance) {
  app.post(
    '/login',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
    },
    loginHandler,
  );

  app.post('/logout', logoutHandler);

  app.get('/me', { preHandler: app.authenticate }, meHandler);
}
