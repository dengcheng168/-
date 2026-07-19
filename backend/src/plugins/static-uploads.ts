import fastifyStatic from '@fastify/static';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { UPLOAD_ROOT } from '../lib/upload-paths.js';

/**
 * 开发环境下直接由后端提供 /uploads 静态文件访问，方便本地联调（生产环境由 Nginx 直接
 * 从挂载卷提供，性能更好；见 nginx/conf.d/default.conf）。保留这个插件对生产环境无害，
 * 只是多了一条不会被 Nginx 转发过来的兜底路由。
 */
export default fp(async function staticUploadsPlugin(app: FastifyInstance) {
  await app.register(fastifyStatic, {
    root: UPLOAD_ROOT,
    prefix: '/uploads/',
    decorateReply: false,
  });
});
