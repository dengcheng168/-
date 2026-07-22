import type { PrismaClient } from '@prisma/client';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import { verifyTurnstileToken } from '../../lib/turnstile.js';
import { sendMail } from '../../lib/mailer.js';
import { toCsv } from '../../lib/csv.js';
import { logger } from '../../lib/logger.js';
import type { CreateInquiryInput, UpdateInquiryInput } from './inquiries.schema.js';

export class TurnstileVerificationError extends Error {}

const DUPLICATE_WINDOW_MS = 2 * 60 * 1000; // 2分钟内相同邮箱+留言视为重复提交

export interface CreateInquiryMeta {
  ipAddress?: string;
  userAgent?: string;
}

export async function createInquiry(
  prisma: PrismaClient,
  input: CreateInquiryInput,
  meta: CreateInquiryMeta,
) {
  const { website, turnstileToken, ...rest } = input;
  const isHoneypotTriggered = !!website;

  // 防重复提交：相同邮箱 + 相同留言内容，在时间窗口内已存在则直接返回该记录，不重复入库
  const duplicate = await prisma.inquiry.findFirst({
    where: {
      email: rest.email,
      message: rest.message ?? null,
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (duplicate) return duplicate;

  if (!isHoneypotTriggered) {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    if (settings?.turnstileEnabled && settings.turnstileSecretKey) {
      if (!turnstileToken) {
        throw new TurnstileVerificationError('缺少人机验证信息');
      }
      const valid = await verifyTurnstileToken(settings.turnstileSecretKey, turnstileToken, meta.ipAddress);
      if (!valid) {
        throw new TurnstileVerificationError('人机验证未通过，请重试');
      }
    }
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      ...rest,
      status: isHoneypotTriggered ? 'SPAM' : 'NEW',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    },
  });

  if (!isHoneypotTriggered) {
    notifyNewInquiry(prisma, inquiry.id).catch((err) => {
      logger.warn({ err }, '询盘邮件提醒发送失败');
    });
  }

  return inquiry;
}

async function notifyNewInquiry(prisma: PrismaClient, inquiryId: number) {
  const [settings, inquiry] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
    prisma.inquiry.findUnique({ where: { id: inquiryId } }),
  ]);

  if (!settings?.smtpEnabled || !settings.smtpHost || !settings.smtpPort || !inquiry) return;
  if (!settings.companyEmail) return;

  await sendMail(
    { host: settings.smtpHost, port: settings.smtpPort, user: settings.smtpUser, password: settings.smtpPassword },
    {
      from: settings.smtpFromEmail ?? settings.companyEmail,
      to: settings.companyEmail,
      subject: `New inquiry from ${inquiry.name}`,
      text: `Name: ${inquiry.name}\nCompany: ${inquiry.company ?? '-'}\nEmail: ${inquiry.email}\nMessage: ${inquiry.message ?? '-'}`,
    },
  );
}

export async function listAdminInquiries(
  prisma: PrismaClient,
  query: PaginationQuery,
  filters: { status?: string; q?: string; sourcePage?: string; pageLanguage?: string },
) {
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.sourcePage ? { sourcePage: filters.sourcePage } : {}),
    ...(filters.pageLanguage ? { pageLanguage: filters.pageLanguage } : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q } },
            { email: { contains: filters.q } },
            { company: { contains: filters.q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true } } },
      ...toSkipTake(query),
    }),
    prisma.inquiry.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(query, total) };
}

export function getInquiryById(prisma: PrismaClient, id: number) {
  return prisma.inquiry.findUnique({
    where: { id },
    include: { product: { select: { id: true, name: true, slug: true } } },
  });
}

export function updateInquiry(prisma: PrismaClient, id: number, input: UpdateInquiryInput) {
  return prisma.inquiry.update({ where: { id }, data: input });
}

export function deleteInquiry(prisma: PrismaClient, id: number) {
  return prisma.inquiry.delete({ where: { id } });
}

export async function exportInquiriesCsv(prisma: PrismaClient, filters: { status?: string; pageLanguage?: string }) {
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.pageLanguage ? { pageLanguage: filters.pageLanguage } : {}),
  };
  const items = await prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' } });

  const csv = toCsv(items, [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'company', header: 'Company' },
    { key: 'country', header: 'Country' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'whatsapp', header: 'WhatsApp' },
    { key: 'productName', header: 'Product' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'message', header: 'Message' },
    { key: 'sourcePage', header: 'Source Page' },
    { key: 'pageLanguage', header: 'Language' },
    { key: 'status', header: 'Status' },
    { key: 'adminNotes', header: 'Admin Notes' },
    { key: 'createdAt', header: 'Submitted At' },
  ]);

  return { csv, count: items.length };
}

export interface CustomerRow {
  email: string;
  name: string;
  company: string | null;
  country: string | null;
  phone: string | null;
  whatsapp: string | null;
  inquiryCount: number;
  // SQLite 聚合列可能被反序列化成 number 或原始的 ISO 字符串，两种 new Date() 都能正确解析
  firstContactAt: string | number;
  lastContactAt: string | number;
}

interface CustomerQueryRow {
  email: string;
  name: string;
  company: string | null;
  country: string | null;
  phone: string | null;
  whatsapp: string | null;
  inquiryCount: number | bigint;
  firstContactAt: string | bigint;
  lastContactAt: string | bigint;
}

/**
 * SQLite 窗口函数/聚合的输出列，Prisma 的 $queryRaw 会保守地按 BigInt 反序列化（哪怕值本身
 * 完全在安全整数范围内），JSON.stringify 又不认识 BigInt，直接透传给 Fastify 序列化会 500。
 */
function bigintToNumber(value: number | bigint): number {
  return typeof value === 'bigint' ? Number(value) : value;
}

/**
 * "客户"不是独立的数据表——按 email 把询盘记录聚合成"客户视图"，取每个 email 最新一条询盘的
 * 联系方式展示，同时给出该邮箱的历史询盘次数和首/末次联系时间。垃圾询盘（SPAM）不计入客户名单。
 * SQLite 支持窗口函数，用一条 SQL 查完，不用 N+1。
 */
export async function listCustomers(prisma: PrismaClient, filters: { q?: string } = {}): Promise<CustomerRow[]> {
  const rows = await prisma.$queryRaw<CustomerQueryRow[]>`
    SELECT email, name, company, country, phone, whatsapp, inquiryCount, firstContactAt, lastContactAt
    FROM (
      SELECT
        email, name, company, country, phone, whatsapp,
        ROW_NUMBER() OVER (PARTITION BY email ORDER BY createdAt DESC) AS rn,
        COUNT(*) OVER (PARTITION BY email) AS inquiryCount,
        MIN(createdAt) OVER (PARTITION BY email) AS firstContactAt,
        MAX(createdAt) OVER (PARTITION BY email) AS lastContactAt
      FROM inquiries
      WHERE status != 'SPAM'
    ) grouped
    WHERE rn = 1
    ORDER BY lastContactAt DESC
  `;

  const customers: CustomerRow[] = rows.map((r) => ({
    email: r.email,
    name: r.name,
    company: r.company,
    country: r.country,
    phone: r.phone,
    whatsapp: r.whatsapp,
    inquiryCount: bigintToNumber(r.inquiryCount),
    firstContactAt: typeof r.firstContactAt === 'bigint' ? bigintToNumber(r.firstContactAt) : r.firstContactAt,
    lastContactAt: typeof r.lastContactAt === 'bigint' ? bigintToNumber(r.lastContactAt) : r.lastContactAt,
  }));
  if (!filters.q) return customers;

  const q = filters.q.toLowerCase();
  return customers.filter(
    (c) =>
      c.email.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.company?.toLowerCase().includes(q) ?? false),
  );
}

export interface SourceStatRow {
  sourcePage: string;
  count: number;
  percentage: number;
}

/** 询盘来源统计：按 sourcePage 分组计数，没有来源信息的归到"(未知来源)"，同样排除 SPAM */
export async function getInquirySourceStats(prisma: PrismaClient): Promise<SourceStatRow[]> {
  const rows = await prisma.inquiry.groupBy({
    by: ['sourcePage'],
    where: { status: { not: 'SPAM' } },
    _count: { _all: true },
  });

  const total = rows.reduce((sum, r) => sum + r._count._all, 0);
  return rows
    .map((r) => ({
      sourcePage: r.sourcePage ?? '(未知来源)',
      count: r._count._all,
      percentage: total > 0 ? Math.round((r._count._all / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
