import type { PrismaClient, Prisma, SiteSetting } from '@prisma/client';
import { fromJsonString, toJsonString } from '../../lib/json.js';

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
