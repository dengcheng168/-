import type { PrismaClient, Prisma, SiteSetting } from '@prisma/client';
import { fromJsonString, toJsonString } from '../../lib/json.js';
import { validateSiteBaseUrl } from '../../lib/site-url.js';
import { isProduction } from '../../config/env.js';

const JSON_FIELDS = [
  'socialLinks',
  'coreAdvantages',
  'stats',
  'oemProcessSteps',
  'factoryStats',
  'factoryPhotos',
  'partnerRegions',
  'footerColumns',
] as const;

type JsonField = (typeof JSON_FIELDS)[number];

async function ensureSettingsRow(prisma: PrismaClient) {
  return prisma.siteSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

function serializeSettings(settings: SiteSetting) {
  const result: Record<string, unknown> = { ...settings };
  for (const field of JSON_FIELDS) {
    const fallback = field === 'footerColumns' ? null : [];
    result[field] = fromJsonString(settings[field as keyof SiteSetting] as string | null, fallback);
  }
  return result;
}

export async function getFullSettings(prisma: PrismaClient) {
  const settings = await ensureSettingsRow(prisma);
  return serializeSettings(settings);
}

export async function getPublicSettings(prisma: PrismaClient) {
  const full = await getFullSettings(prisma);
  const {
    smtpEnabled: _smtpEnabled,
    smtpHost: _smtpHost,
    smtpPort: _smtpPort,
    smtpUser: _smtpUser,
    smtpPassword: _smtpPassword,
    smtpFromEmail: _smtpFromEmail,
    turnstileSecretKey: _turnstileSecretKey,
    ...publicSafe
  } = full as Record<string, unknown>;
  return publicSafe;
}

export async function patchSettings(prisma: PrismaClient, patch: Record<string, unknown>) {
  await ensureSettingsRow(prisma);

  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    data[key] = JSON_FIELDS.includes(key as JsonField) ? toJsonString(value) : value;
  }

  const updated = await prisma.siteSetting.update({
    where: { id: 1 },
    data: data as Prisma.SiteSettingUpdateInput,
  });

  return serializeSettings(updated);
}

export interface UpdateSiteBaseUrlResult {
  ok: boolean;
  error?: string;
  settings?: ReturnType<typeof serializeSettings>;
  previousValue?: string | null;
  newValue?: string | null;
}

/**
 * 正式站点域名的写入入口，独立于上面通用的 patchSettings：这里的校验规则依赖运行环境
 * （生产环境拒绝 localhost/内网 IP，开发环境放行），不是简单的"传什么存什么"。
 * 传空字符串或 null 表示清空后台覆盖值，之后由运行时 SITE_URL 环境变量兜底。
 */
export async function updateSiteBaseUrl(prisma: PrismaClient, rawValue: string | null): Promise<UpdateSiteBaseUrlResult> {
  const current = await ensureSettingsRow(prisma);
  const previousValue = current.siteBaseUrl;

  let newValue: string | null;
  if (rawValue === null || rawValue.trim() === '') {
    newValue = null;
  } else {
    const result = validateSiteBaseUrl(rawValue, { allowLocalhost: !isProduction });
    if (!result.ok) {
      return { ok: false, error: result.message };
    }
    newValue = result.value ?? null;
  }

  const updated = await prisma.siteSetting.update({ where: { id: 1 }, data: { siteBaseUrl: newValue } });
  return { ok: true, settings: serializeSettings(updated), previousValue, newValue };
}
