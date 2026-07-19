import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { INQUIRY_ROLES } from '../../config/roles.js';
import {
  publicCreateHandler,
  adminListHandler,
  adminDetailHandler,
  adminUpdateHandler,
  adminDeleteHandler,
  adminExportCsvHandler,
} from './inquiries.controller.js';

export async function publicInquiryRoutes(app: FastifyInstance) {
  app.post(
    '/inquiries',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
    },
    publicCreateHandler,
  );
}

export async function adminInquiryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(INQUIRY_ROLES));

  // 注意：/inquiries/export.csv 必须在 /inquiries/:id 之前注册，避免被当作 :id 参数匹配
  app.get('/inquiries/export.csv', adminExportCsvHandler);
  app.get('/inquiries', adminListHandler);
  app.get('/inquiries/:id', adminDetailHandler);
  app.patch('/inquiries/:id', adminUpdateHandler);
  app.delete('/inquiries/:id', adminDeleteHandler);
}
