import type { FastifyInstance } from 'fastify';
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
  adminTestSmtpHandler,
} from './settings.controller.js';

export async function publicSettingsRoutes(app: FastifyInstance) {
  app.get('/settings/public', publicSettingsHandler);
}

export async function adminSettingsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/settings', adminGetSettingsHandler);
  app.patch('/settings/seo', adminPatchSeoHandler);
  app.patch('/settings/contact', adminPatchContactHandler);
  app.patch('/settings/social', adminPatchSocialHandler);
  app.patch('/settings/whatsapp', adminPatchWhatsappHandler);
  app.patch('/settings/smtp', adminPatchSmtpHandler);
  app.patch('/settings/homepage', adminPatchHomepageHandler);
  app.patch('/settings/footer', adminPatchFooterHandler);
  app.patch('/settings/turnstile', adminPatchTurnstileHandler);
  app.post('/settings/smtp/test', adminTestSmtpHandler);
}
