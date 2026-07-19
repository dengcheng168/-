import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

export default fp(async function requestLoggerPlugin(app: FastifyInstance) {
  app.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTimeMs: reply.elapsedTime,
        ip: request.ip,
      },
      'request completed',
    );
  });
});
