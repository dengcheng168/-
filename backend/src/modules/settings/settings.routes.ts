import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { CONTENT_ROLES, SETTINGS_SENSITIVE_ROLES } from '../../config/roles.js';
import {
  publicSettingsHandler,
  adminGetSettingsHandler,
  adminPatchSeoHandler,
  adminPatchContactHandler,
  adminPatchSocialHandler,
  adminPatchWhatsappHandler,
  adminPatchSmtpHandler,
  adminPatchHomepageHandler,
  adminPatchFooterHandler,
  adminPatchTurnstileHandler,
  adminPatchPixelsHandler,
  adminTestSmtpHandler,
} from './settings.controller.js';

export async function publicSettingsRoutes(app: FastifyInstance) {
  app.get('/settings/public', publicSettingsHandler);
}

export async function adminSettingsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  // 内容管理员可以改公司资料/SEO/社交/WhatsApp/首页/页脚，但不能碰 SMTP 凭据和 Turnstile
  // 密钥——那两个路由下面单独再加一层 SUPER_ADMIN-only 校验，两层 preHandler 是"与"的关系。
  app.addHook('preHandler', requireRole(CONTENT_ROLES));

  app.get('/settings', adminGetSettingsHandler);
  app.patch('/settings/seo', adminPatchSeoHandler);
  app.patch('/settings/contact', adminPatchContactHandler);
  app.patch('/settings/social', adminPatchSocialHandler);
  app.patch('/settings/whatsapp', adminPatchWhatsappHandler);
  app.patch('/settings/smtp', { preHandler: requireRole(SETTINGS_SENSITIVE_ROLES) }, adminPatchSmtpHandler);
  app.patch('/settings/homepage', adminPatchHomepageHandler);
  app.patch('/settings/footer', adminPatchFooterHandler);
  app.patch('/settings/turnstile', { preHandler: requireRole(SETTINGS_SENSITIVE_ROLES) }, adminPatchTurnstileHandler);
  app.post('/settings/smtp/test', { preHandler: requireRole(SETTINGS_SENSITIVE_ROLES) }, adminTestSmtpHandler);
  app.patch('/settings/pixels', adminPatchPixelsHandler);
}
