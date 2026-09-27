import type { PrismaClient } from '@prisma/client';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type {
  CreateCertificateInput,
  UpdateCertificateInput,
  UpsertCertificateTranslationInput,
} from './certificates.schema.js';

function serializeCertificate<T extends { applicableModels: string }>(certificate: T) {
  let applicableModels: string[] = [];
  try {
    const parsed: unknown = JSON.parse(certificate.applicableModels);
    if (Array.isArray(parsed)) applicableModels = parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    // Invalid legacy/manual values are exposed as an empty, unverified scope.
  }
  return { ...certificate, applicableModels };
}

async function attachCertificateTranslations<T extends { id: number }>(
  prisma: PrismaClient,
  items: T[],
  locale: string | undefined,
) {
  if (!locale || items.length === 0) return items;
  const rows = await prisma.certificateTranslation.findMany({
    where: { certificateId: { in: items.map((i) => i.id) }, locale, translationStatus: 'PUBLISHED' },
  });
  const byId = new Map(rows.map((r) => [r.certificateId, r]));
  return items.map((item) => ({ ...item, translation: byId.get(item.id) ?? null }));
}

export async function listPublishedCertificates(prisma: PrismaClient, locale?: string) {
  const certificates = await prisma.certificate.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });
  return attachCertificateTranslations(prisma, certificates.map(serializeCertificate), locale);
}

export async function listAdminCertificates(prisma: PrismaClient, query: PaginationQuery, search?: string) {
  const where = { deletedAt: null, ...(search ? { name: { contains: search } } : {}) };
  const [items, total] = await Promise.all([
    prisma.certificate.findMany({ where, orderBy: { sortOrder: 'asc' }, ...toSkipTake(query) }),
    prisma.certificate.count({ where }),
  ]);
  return { items: items.map(serializeCertificate), meta: buildPaginationMeta(query, total) };
}

export async function getCertificateById(prisma: PrismaClient, id: number) {
  const certificate = await prisma.certificate.findFirst({ where: { id, deletedAt: null } });
  return certificate ? serializeCertificate(certificate) : null;
}

export function createCertificate(prisma: PrismaClient, input: CreateCertificateInput) {
  return prisma.certificate.create({ data: { ...input, applicableModels: JSON.stringify(input.applicableModels) } });
}

/**
 * 更新前先确认证书仍然存在且未被软删除，避免并发场景下"复活"一个已经被删除的证书
 * （做法同 products.service.ts 的 updateProduct，见那里的注释）。返回 null 交给 controller 转成 404。
 */
export async function updateCertificate(prisma: PrismaClient, id: number, input: UpdateCertificateInput) {
  const existing = await prisma.certificate.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;
  const { applicableModels, ...data } = input;
  return prisma.certificate.update({
    where: { id },
    data: { ...data, ...(applicableModels ? { applicableModels: JSON.stringify(applicableModels) } : {}) },
  });
}

export function softDeleteCertificate(prisma: PrismaClient, id: number) {
  return prisma.certificate.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function reorderCertificates(prisma: PrismaClient, items: { id: number; sortOrder: number }[]) {
  await prisma.$transaction(
    items.map((item) => prisma.certificate.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })),
  );
}

export function getCertificateTranslation(prisma: PrismaClient, certificateId: number, locale: string) {
  return prisma.certificateTranslation.findUnique({ where: { certificateId_locale: { certificateId, locale } } });
}

export function upsertCertificateTranslation(
  prisma: PrismaClient,
  certificateId: number,
  locale: string,
  input: UpsertCertificateTranslationInput,
  updatedBy?: number,
) {
  const data = { ...input, updatedBy };
  return prisma.certificateTranslation.upsert({
    where: { certificateId_locale: { certificateId, locale } },
    create: { certificateId, locale, ...data },
    update: data,
  });
}
