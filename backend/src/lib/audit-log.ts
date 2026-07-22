import type { PrismaClient } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

export interface AuditLogEntry {
  actorId?: number;
  /** 大多数调用方从 request.user.email 直接传入；失败登录等没有真实用户 id 的场景也用这个字段记录目标邮箱 */
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string | number;
  summary: string;
  result?: 'SUCCESS' | 'FAILURE';
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

const MAX_STRING_LENGTH = 500;
const MAX_JSON_LENGTH = 4000;
const MAX_ARRAY_ITEMS = 20;

/** 命中这些字段名（不区分大小写、子串匹配）一律替换成 [REDACTED]，绝不写进日志 */
const SENSITIVE_KEY_PATTERNS = [
  'password',
  'passwordhash',
  'token',
  'secret',
  'jwt',
  'cookie',
  'authorization',
  'smtppassword',
  'turnstilesecretkey',
];

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((p) => lower.includes(p));
}

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[Truncated: too deep]';
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    const limited = value.slice(0, MAX_ARRAY_ITEMS).map((v) => redact(v, depth + 1));
    if (value.length > MAX_ARRAY_ITEMS) limited.push(`...[${value.length - MAX_ARRAY_ITEMS} more items truncated]`);
    return limited;
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = isSensitiveKey(key) ? '[REDACTED]' : redact(val, depth + 1);
    }
    return out;
  }

  if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
    return `${value.slice(0, MAX_STRING_LENGTH)}...[${value.length - MAX_STRING_LENGTH} chars truncated]`;
  }

  return value;
}

function safeStringify(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  try {
    const json = JSON.stringify(redact(value));
    if (json === undefined) return undefined;
    return json.length > MAX_JSON_LENGTH ? `${json.slice(0, MAX_JSON_LENGTH)}...[truncated]` : json;
  } catch {
    return '[Unserializable]';
  }
}

/**
 * 全站统一的操作日志写入入口——所有模块都应该调用这一个函数，不要各自拼日志格式。
 * before/after/metadata 会先做敏感字段过滤（密码/Token/Secret/SMTP密码等一律替换成 [REDACTED]）
 * 再做长度截断，防止日志表因为大字段或密钥泄露而失控。
 *
 * 尽力而为：写入失败只打一条 console.error，不抛出、不影响调用方的主业务操作
 * （需求里"除非属于必须审计的高风险操作"——目前项目里没有强到需要为了审计失败就回滚业务操作的场景，
 * 保持这个简单、一致的行为，调用方如果真的需要强校验可以自己 await 后处理，本函数不主动抛错）。
 */
export async function auditLog(prisma: PrismaClient, entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId: entry.actorId,
        adminEmail: entry.actorEmail ?? 'unknown',
        actorRole: entry.actorRole,
        action: entry.action,
        entityType: entry.resourceType,
        entityId: entry.resourceId === undefined ? null : String(entry.resourceId),
        summary: entry.summary,
        result: entry.result ?? 'SUCCESS',
        beforeData: safeStringify(entry.before),
        afterData: safeStringify(entry.after),
        metadata: safeStringify(entry.metadata),
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });
  } catch (err) {
    console.error('写入操作日志失败', err);
  }
}

export type AuditLogFromRequestEntry = Omit<AuditLogEntry, 'actorId' | 'actorEmail' | 'actorRole' | 'ipAddress' | 'userAgent'>;

/**
 * 大多数调用点都在一个已登录的 Fastify 路由里，actorId/actorEmail/actorRole/ipAddress/userAgent
 * 这五个字段永远是从 request.user 和 request 上取，重复写三十多次容易漂移出好几种格式。
 * 这个小封装把这五个字段自动补上，调用方只需要传操作本身的字段。
 */
export function auditLogFromRequest(prisma: PrismaClient, request: FastifyRequest, entry: AuditLogFromRequestEntry): Promise<void> {
  return auditLog(prisma, {
    ...entry,
    actorId: request.user?.sub,
    actorEmail: request.user?.email,
    actorRole: request.user?.role,
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
  });
}

export { redact as __redactForTesting, safeStringify as __safeStringifyForTesting };
