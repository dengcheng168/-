import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { COOKIE_NAME } from '../config/constants.js';
import { requireAuth } from '../middleware/require-auth.js';

export default fp(async function authPlugin(app: FastifyInstance) {
  await app.register(fastifyCookie);

  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: COOKIE_NAME,
      signed: false,
    },
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  app.decorate('authenticate', requireAuth);
});
