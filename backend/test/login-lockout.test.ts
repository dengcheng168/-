import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { checkLoginLock, recordLoginAttempt, getRecentFailureCount } from '../src/modules/auth/auth.service.js';

// 直接测服务函数、不走 HTTP——路由层还叠了一个 5次/分钟 的 IP 限流（@fastify/rate-limit），
// 两层都在保护登录接口，但会互相干扰对方的精确断言，这里只关心 checkLoginLock 自己的三维度逻辑。
const prisma = new PrismaClient();

function testEmail(label: string): string {
  return `lockout-test-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function cleanup(email: string, ip: string) {
  await prisma.loginLog.deleteMany({ where: { OR: [{ email }, { ipAddress: ip }] } });
}

test('email+IP dimension: locks after 5 failures for the same email+IP pair', async () => {
  const email = testEmail('email-ip');
  const ip = `10.0.1.${Math.floor(Math.random() * 250)}`;
  try {
    for (let i = 0; i < 4; i++) {
      await recordLoginAttempt(prisma, { email, success: false, reason: 'INVALID_CREDENTIALS', ipAddress: ip });
    }
    let result = await checkLoginLock(prisma, email, ip);
    assert.equal(result.locked, false, '4 次失败还不应该锁');

    await recordLoginAttempt(prisma, { email, success: false, reason: 'INVALID_CREDENTIALS', ipAddress: ip });
    result = await checkLoginLock(prisma, email, ip);
    assert.equal(result.locked, true, '第 5 次失败应该触发锁定');
    assert.equal(result.reason, 'LOCKED_EMAIL_IP');
  } finally {
    await cleanup(email, ip);
  }
});

test('email+IP dimension does not lock a different IP for the same email (avoids DoS via one attacker IP)', async () => {
  const email = testEmail('cross-ip');
  const attackerIp = `10.0.2.${Math.floor(Math.random() * 250)}`;
  const realAdminIp = `10.0.3.${Math.floor(Math.random() * 250)}`;
  try {
    for (let i = 0; i < 5; i++) {
      await recordLoginAttempt(prisma, { email, success: false, reason: 'INVALID_CREDENTIALS', ipAddress: attackerIp });
    }
    const attackerResult = await checkLoginLock(prisma, email, attackerIp);
    assert.equal(attackerResult.locked, true, '攻击者的 IP+邮箱组合应该被锁');

    const realAdminResult = await checkLoginLock(prisma, email, realAdminIp);
    assert.equal(realAdminResult.locked, false, '真实管理员从自己正常的 IP 登录不应该被攻击者的失败次数连累（除非累计到跨 IP 阈值）');
  } finally {
    await cleanup(email, attackerIp);
    await cleanup(email, realAdminIp);
  }
});

test('IP-wide dimension: locks the IP after spraying many different emails', async () => {
  const ip = `10.0.4.${Math.floor(Math.random() * 250)}`;
  const emails = Array.from({ length: 15 }, (_, i) => testEmail(`spray-${i}`));
  try {
    for (const email of emails) {
      await recordLoginAttempt(prisma, { email, success: false, reason: 'INVALID_CREDENTIALS', ipAddress: ip });
    }
    const result = await checkLoginLock(prisma, testEmail('spray-final'), ip);
    assert.equal(result.locked, true, '同一个 IP 打了 15 个不同邮箱后，这个 IP 应该被锁（不管这次打的是哪个邮箱）');
    assert.equal(result.reason, 'LOCKED_IP_WIDE');
  } finally {
    for (const email of emails) await cleanup(email, ip);
  }
});

test('email-wide dimension: high threshold prevents a trivial DoS via one attacker repeatedly guessing across many IPs', async () => {
  const email = testEmail('email-wide');
  const ips = Array.from({ length: 10 }, (_, i) => `10.0.5.${i}`);
  try {
    // 10 个不同 IP 各打 2 次（共 20 次），还没到 email-wide 阈值（30），也没有任何单一 IP+邮箱组合达到 5 次
    for (const ip of ips) {
      await recordLoginAttempt(prisma, { email, success: false, reason: 'INVALID_CREDENTIALS', ipAddress: ip });
      await recordLoginAttempt(prisma, { email, success: false, reason: 'INVALID_CREDENTIALS', ipAddress: ip });
    }
    const stillOpen = await checkLoginLock(prisma, email, '10.0.5.99');
    assert.equal(stillOpen.locked, false, '20 次跨 IP 失败还不足以锁死这个邮箱——阈值故意设高，避免攻击者靠反复输错密码把真管理员锁在门外');

    const failureCount = await getRecentFailureCount(prisma, email);
    assert.equal(failureCount, 20);
  } finally {
    for (const ip of ips) await cleanup(email, ip);
  }
});

test('successful login clears the failure window (failures before success no longer count)', async () => {
  const email = testEmail('clear-on-success');
  const ip = `10.0.6.${Math.floor(Math.random() * 250)}`;
  try {
    for (let i = 0; i < 4; i++) {
      await recordLoginAttempt(prisma, { email, success: false, reason: 'INVALID_CREDENTIALS', ipAddress: ip });
    }
    await recordLoginAttempt(prisma, { email, success: true, ipAddress: ip });

    // 成功登录之后，之前的 4 次失败不应该再被计入
    const countAfterSuccess = await getRecentFailureCount(prisma, email);
    assert.equal(countAfterSuccess, 0, '成功登录后失败计数应该清零（按时间窗口口径，不是删除历史记录）');

    // 再失败 4 次也不应该锁（因为计数是从成功登录之后重新算的）
    for (let i = 0; i < 4; i++) {
      await recordLoginAttempt(prisma, { email, success: false, reason: 'INVALID_CREDENTIALS', ipAddress: ip });
    }
    const result = await checkLoginLock(prisma, email, ip);
    assert.equal(result.locked, false);
  } finally {
    await cleanup(email, ip);
  }
});

test('login history is never deleted by the clearing mechanism (audit trail stays intact)', async () => {
  const email = testEmail('history-preserved');
  const ip = `10.0.7.${Math.floor(Math.random() * 250)}`;
  try {
    await recordLoginAttempt(prisma, { email, success: false, reason: 'INVALID_CREDENTIALS', ipAddress: ip });
    await recordLoginAttempt(prisma, { email, success: true, ipAddress: ip });

    const allRows = await prisma.loginLog.findMany({ where: { email } });
    assert.equal(allRows.length, 2, '清理失败计数不应该删除 LoginLog 历史记录，只是查询时限定时间窗口');
  } finally {
    await cleanup(email, ip);
  }
});
