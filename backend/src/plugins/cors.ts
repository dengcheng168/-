import cors from '@fastify/cors';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

export default fp(async function corsPlugin(app: FastifyInstance) {
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });
});
