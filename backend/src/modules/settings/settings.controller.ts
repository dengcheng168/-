import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
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

function makePatchHandler(schema: { parse: (input: unknown) => Record<string, unknown> }) {
  return async (request: FastifyRequest) => {
    const input = schema.parse(request.body);
    return ok(await patchSettings(request.server.prisma, input));
  };
}

export const adminPatchSeoHandler = makePatchHandler(seoSettingsSchema);
export const adminPatchContactHandler = makePatchHandler(contactSettingsSchema);
export const adminPatchSocialHandler = makePatchHandler(socialSettingsSchema);
export const adminPatchWhatsappHandler = makePatchHandler(whatsappSettingsSchema);
export const adminPatchSmtpHandler = makePatchHandler(smtpSettingsSchema);
export const adminPatchHomepageHandler = makePatchHandler(homepageSettingsSchema);
export const adminPatchFooterHandler = makePatchHandler(footerSettingsSchema);
export const adminPatchTurnstileHandler = makePatchHandler(turnstileSettingsSchema);

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
