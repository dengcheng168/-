import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyError } from 'fastify';
import { ZodError } from 'zod';
import { fail } from '../lib/api-response.js';
import { isProduction } from '../config/env.js';

export default fp(async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError | ZodError, request, reply) => {
    if (error instanceof ZodError) {
      request.log.warn({ err: error }, '请求参数校验失败');
      return reply.status(400).send(fail('请求参数不合法', 'VALIDATION_ERROR', error.flatten()));
    }

    const fastifyError = error as FastifyError;
    const statusCode = fastifyError.statusCode ?? 500;

    if (statusCode >= 500) {
      request.log.error({ err: error }, '服务器内部错误');
      return reply
        .status(statusCode)
        .send(
          fail(
            isProduction ? '服务器内部错误' : fastifyError.message,
            fastifyError.code,
            isProduction ? undefined : fastifyError.stack,
          ),
        );
    }

    request.log.warn({ err: error }, '请求处理失败');
    return reply.status(statusCode).send(fail(fastifyError.message, fastifyError.code));
  });

  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send(fail(`接口不存在：${request.method} ${request.url}`, 'NOT_FOUND'));
  });
});
