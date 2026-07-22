import multipart from '@fastify/multipart';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { MAX_BATCH_UPLOAD_FILES } from '../config/constants.js';

export default fp(async function multipartPlugin(app: FastifyInstance) {
  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
      // 单文件上传接口一次只发一个文件；批量上传页面一次最多 MAX_BATCH_UPLOAD_FILES 个，
      // 这个插件是全局注册的，取两者中较大值，具体"只允许 1 个"的限制留给单文件 handler 自己校验
      files: MAX_BATCH_UPLOAD_FILES,
    },
  });
});
