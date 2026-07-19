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
  filters: { status?: string; q?: string },
) {
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
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

export async function exportInquiriesCsv(prisma: PrismaClient, filters: { status?: string }) {
  const where = filters.status ? { status: filters.status } : {};
  const items = await prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' } });

  return toCsv(items, [
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
    { key: 'status', header: 'Status' },
    { key: 'adminNotes', header: 'Admin Notes' },
    { key: 'createdAt', header: 'Submitted At' },
  ]);
}
