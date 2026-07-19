import multipart from '@fastify/multipart';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

export default fp(async function multipartPlugin(app: FastifyInstance) {
  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
      files: 1,
    },
  });
});
