import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import { getFullSettings, getPublicSettings, patchSettings } from './settings.service.js';
import { verifySmtpConnection } from '../../lib/mailer.js';
import {
  seoSettingsSchema,
  contactSettingsSchema,
  socialSettingsSchema,
  whatsappSettingsSchema,
  smtpSettingsSchema,
  homepageSettingsSchema,
  footerSettingsSchema,
  turnstileSettingsSchema,
} from './settings.schema.js';

export async function publicSettingsHandler(request: FastifyRequest) {
  return ok(await getPublicSettings(request.server.prisma));
}

export async function adminGetSettingsHandler(request: FastifyRequest) {
  return ok(await getFullSettings(request.server.prisma));
}

function makePatchHandler(
  schema: { parse: (input: unknown) => Record<string, unknown> },
  action: string,
  summary: string,
  buildAfter: (input: Record<string, unknown>) => Record<string, unknown> = (input) => input,
) {
  return async (request: FastifyRequest) => {
    const input = schema.parse(request.body);
    const settings = await patchSettings(request.server.prisma, input);
    await auditLogFromRequest(request.server.prisma, request, {
      action,
      resourceType: 'settings',
      resourceId: 1,
      summary,
      after: buildAfter(input),
    });
    return ok(settings);
  };
}

/** SMTP 密码绝不能出现在日志里，即使 audit-log 底层也会做敏感字段过滤，这里仍然显式剔除，双重保险 */
function omitSmtpPassword(input: Record<string, unknown>): Record<string, unknown> {
  const { smtpPassword: _smtpPassword, ...rest } = input;
  return rest;
}

/** Turnstile secret key 同理，绝不写入日志 */
function omitTurnstileSecretKey(input: Record<string, unknown>): Record<string, unknown> {
  const { turnstileSecretKey: _turnstileSecretKey, ...rest } = input;
  return rest;
}

export const adminPatchSeoHandler = makePatchHandler(seoSettingsSchema, 'settings.seo_update', '更新 SEO 设置');
export const adminPatchContactHandler = makePatchHandler(contactSettingsSchema, 'settings.contact_update', '更新联系方式设置');
export const adminPatchSocialHandler = makePatchHandler(socialSettingsSchema, 'settings.social_update', '更新社交媒体设置');
export const adminPatchWhatsappHandler = makePatchHandler(whatsappSettingsSchema, 'settings.whatsapp_update', '更新 WhatsApp 设置');
export const adminPatchSmtpHandler = makePatchHandler(
  smtpSettingsSchema,
  'settings.smtp_update',
  '更新 SMTP 设置',
  omitSmtpPassword,
);
export const adminPatchHomepageHandler = makePatchHandler(homepageSettingsSchema, 'settings.homepage_update', '更新首页设置');
export const adminPatchFooterHandler = makePatchHandler(footerSettingsSchema, 'settings.footer_update', '更新页脚设置');
export const adminPatchTurnstileHandler = makePatchHandler(
  turnstileSettingsSchema,
  'settings.turnstile_update',
  '更新 Turnstile 人机验证设置',
  omitTurnstileSecretKey,
);

export async function adminTestSmtpHandler(request: FastifyRequest, reply: FastifyReply) {
  const settings = await getFullSettings(request.server.prisma);
  const host = settings.smtpHost as string | null;
  const port = settings.smtpPort as number | null;

  if (!host || !port) {
    return reply.status(400).send(fail('请先填写 SMTP 服务器地址和端口', 'SMTP_NOT_CONFIGURED'));
  }

  try {
    await verifySmtpConnection({
      host,
      port,
      user: settings.smtpUser as string | null,
      password: settings.smtpPassword as string | null,
    });
    return ok({ connected: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.status(400).send(fail(`SMTP 连接测试失败：${message}`, 'SMTP_CONNECTION_FAILED'));
  }
}
