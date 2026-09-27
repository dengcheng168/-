import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyError } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { fail } from '../lib/api-response.js';
import { isProduction } from '../config/env.js';

/** Prisma 唯一约束字段名 -> 人话字段名，用于把 P2002 翻译成可读提示 */
const UNIQUE_FIELD_LABELS: Record<string, string> = {
  slug: 'Slug',
  sku: 'SKU',
  email: '邮箱',
};

export default fp(async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError | ZodError, request, reply) => {
    if (error instanceof ZodError) {
      request.log.warn({ err: error }, '请求参数校验失败');
      return reply.status(400).send(fail('请求参数不合法', 'VALIDATION_ERROR', error.flatten()));
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[] | string | undefined) ?? [];
      const fields = Array.isArray(target) ? target : [target];
      const labels = fields.map((f) => UNIQUE_FIELD_LABELS[f] ?? f).join('、');
      request.log.warn({ err: error }, '唯一约束冲突');
      return reply.status(409).send(fail(`${labels || '该字段'}已被使用，请更换后重试`, 'UNIQUE_CONSTRAINT'));
    }

    const fastifyError = error as FastifyError;
    const statusCode = fastifyError.statusCode ?? 500;

    // @fastify/rate-limit throws the object returned by errorResponseBuilder.
    // Preserve our existing API envelope instead of wrapping it a second time
    // and losing the RATE_LIMITED code. The plugin has already attached the
    // standard rate-limit and Retry-After response headers at this point.
    const rateLimitEnvelope = error as FastifyError & {
      success?: boolean;
      error?: { message?: string; code?: string; details?: unknown };
    };
    if (statusCode === 429 && rateLimitEnvelope.success === false && rateLimitEnvelope.error) {
      request.log.warn({ err: error }, '请求处理失败');
      return reply.status(statusCode).send({
        success: false,
        error: {
          message: rateLimitEnvelope.error.message ?? '请求过于频繁，请稍后再试',
          code: rateLimitEnvelope.error.code ?? 'RATE_LIMITED',
          details: rateLimitEnvelope.error.details,
        },
      });
    }

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
