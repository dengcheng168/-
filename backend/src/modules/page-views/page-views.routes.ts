import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES } from '../../config/roles.js';
import { publicRecordHandler, adminListHandler } from './page-views.controller.js';

export async function publicPageViewRoutes(app: FastifyInstance) {
  app.post(
    '/page-views',
    {
      // 比全局限流（300/min）更严格，但比询盘表单（5/min）宽松得多——正常访客快速多页浏览
      // 也不应该被拦，只是防止脚本刷量。
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    },
    publicRecordHandler,
  );
}

export async function adminPageViewRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  // 跟产品/文章数量同一档权限（CONTENT_ROLES），SALES 看不到——和后台首页其它统计卡片
  // 目前对 SALES 的行为一致（countOf 请求失败会被吞掉显示成 0，不是本次新加的限制）。
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/page-views', adminListHandler);
}
