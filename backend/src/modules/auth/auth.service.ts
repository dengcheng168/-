import type { PrismaClient } from '@prisma/client';
import { verifyPassword, hashPassword } from '../../lib/password.js';

const LOCKOUT_WINDOW_MINUTES = 15;
/** 同一邮箱+同一 IP 失败次数达到这个值就锁——这是主要防护，不会因为攻击者换 IP 而误伤其他人 */
const EMAIL_IP_THRESHOLD = 5;
/** 同一 IP 打不同邮箱（撞库/喷洒攻击）达到这个值就锁这个 IP */
const IP_WIDE_THRESHOLD = 15;
/**
 * 同一邮箱跨所有 IP 失败达到这个值才锁——阈值故意设得比另外两个高很多，
 * 因为这个维度攻击者只要知道管理员邮箱、换着 IP 瞎猜密码就能触发，
 * 阈值太低会变成"谁都能靠反复输错密码把真管理员锁在门外"的拒绝服务漏洞。
 */
const EMAIL_WIDE_THRESHOLD = 30;

/**
 * 用于阻止通过响应时间差判断邮箱是否存在的计时一致性哈希：邮箱不存在时也要做一次同等耗时的
 * argon2 校验（对一个谁都不知道明文的哈希），而不是提前 return，避免"存在的邮箱验证更慢"这种
 * 时间侧信道泄露账号是否存在。模块加载时生成一次，不对应任何真实密码。
 */
const DUMMY_PASSWORD_HASH = await hashPassword(`timing-safety-${Date.now()}-${Math.random()}`);

export type LoginFailureReason = 'INVALID_CREDENTIALS' | 'INACTIVE' | 'LOCKED_EMAIL_IP' | 'LOCKED_IP_WIDE' | 'LOCKED_EMAIL_WIDE';

export async function authenticateAdmin(
  prisma: PrismaClient,
  email: string,
  password: string,
): Promise<{ user: Awaited<ReturnType<typeof findAdminByEmail>>; reason?: LoginFailureReason }> {
  const user = await findAdminByEmail(prisma, email);

  if (!user) {
    // 邮箱不存在：仍然做一次耗时相近的哈希校验（针对 dummy hash 必然返回 false），
    // 保证"邮箱不存在"和"邮箱存在但密码错"两种情况响应时间、响应内容都一致。
    await verifyPassword(DUMMY_PASSWORD_HASH, password);
    return { user: null, reason: 'INVALID_CREDENTIALS' };
  }

  if (!user.isActive) {
    // 账号已停用：同样先做一次校验避免时间差，再统一按凭据错误处理（不透露"账号存在但被停用"）
    await verifyPassword(user.passwordHash, password);
    return { user: null, reason: 'INACTIVE' };
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) return { user: null, reason: 'INVALID_CREDENTIALS' };

  return { user };
}

function findAdminByEmail(prisma: PrismaClient, email: string) {
  return prisma.adminUser.findUnique({ where: { email } });
}

export async function touchLastLogin(prisma: PrismaClient, userId: number) {
  await prisma.adminUser.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
}

export async function getAdminById(prisma: PrismaClient, id: number) {
  return prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true },
  });
}

/**
 * 该邮箱这次应该从哪个时间点开始统计失败次数：15 分钟窗口起点、最近一次成功登录时间、
 * 最近一次手动解锁时间，取三者中最晚的一个。不删除历史 LoginLog（审计记录要保持真实），
 * 用这个时间点当下限查询即可实现"登录成功/解锁后清理失败计数"的效果。
 */
export async function resolveEmailFailureWindowStart(prisma: PrismaClient, email: string): Promise<Date> {
  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000);

  const [lastSuccess, user] = await Promise.all([
    prisma.loginLog.findFirst({ where: { email, success: true }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
    prisma.adminUser.findUnique({ where: { email }, select: { unlockedAt: true } }),
  ]);

  return [windowStart, lastSuccess?.createdAt, user?.unlockedAt]
    .filter((d): d is Date => !!d)
    .reduce((latest, d) => (d > latest ? d : latest), windowStart);
}

export async function getRecentFailureCount(prisma: PrismaClient, email: string): Promise<number> {
  const since = await resolveEmailFailureWindowStart(prisma, email);
  return prisma.loginLog.count({ where: { email, success: false, createdAt: { gte: since } } });
}

/** 三个维度一起判断是否应该拒绝这次登录尝试，任意一个命中就锁。 */
export async function checkLoginLock(
  prisma: PrismaClient,
  email: string,
  ipAddress: string | undefined,
): Promise<{ locked: boolean; reason?: LoginFailureReason }> {
  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000);
  const emailCountSince = await resolveEmailFailureWindowStart(prisma, email);

  const [emailIpFailures, emailWideFailures] = await Promise.all([
    ipAddress
      ? prisma.loginLog.count({ where: { email, ipAddress, success: false, createdAt: { gte: emailCountSince } } })
      : Promise.resolve(0),
    prisma.loginLog.count({ where: { email, success: false, createdAt: { gte: emailCountSince } } }),
  ]);

  if (emailIpFailures >= EMAIL_IP_THRESHOLD) return { locked: true, reason: 'LOCKED_EMAIL_IP' };
  if (emailWideFailures >= EMAIL_WIDE_THRESHOLD) return { locked: true, reason: 'LOCKED_EMAIL_WIDE' };

  if (ipAddress) {
    const ipWideFailures = await prisma.loginLog.count({
      where: { ipAddress, success: false, createdAt: { gte: windowStart } },
    });
    if (ipWideFailures >= IP_WIDE_THRESHOLD) return { locked: true, reason: 'LOCKED_IP_WIDE' };
  }

  return { locked: false };
}

export const LOCKOUT_THRESHOLDS = { EMAIL_IP_THRESHOLD, IP_WIDE_THRESHOLD, EMAIL_WIDE_THRESHOLD };

export function recordLoginAttempt(
  prisma: PrismaClient,
  entry: { email: string; success: boolean; reason?: string; ipAddress?: string; userAgent?: string },
): Promise<unknown> {
  return prisma.loginLog.create({ data: entry }).catch(() => undefined);
}

export const LOGIN_LOCKOUT_WINDOW_MINUTES = LOCKOUT_WINDOW_MINUTES;
