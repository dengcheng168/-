import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { env } from '../src/config/env.js';

const ADMIN_EMAIL = env.ADMIN_INIT_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = env.ADMIN_INIT_PASSWORD ?? 'change-me-please';

/**
 * 这个文件用真实种子超级管理员账号做登录测试（不是临时账号），所以每个用例结束后都要把
 * 自己在 LoginLog 里留下的记录清掉——现在登录失败次数会真的触发锁定（见 auth.service.ts），
 * 如果不清理，每跑一次测试套件就会往这个共享账号头上加一次失败记录，迟早会把它真的锁死，
 * 之前就是因为这个原因间接把 admin@example.com 锁定过一次。
 */
async function cleanupLoginLogsSince(app: Awaited<ReturnType<typeof buildApp>>, since: Date) {
  await app.prisma.loginLog.deleteMany({ where: { email: ADMIN_EMAIL, createdAt: { gte: since } } });
}

test('login with wrong password returns 401', async () => {
  const app = await buildApp();
  const since = new Date();
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: ADMIN_EMAIL, password: 'definitely-wrong' },
    });
    assert.equal(res.statusCode, 401);
    assert.equal(res.json().success, false);
  } finally {
    await cleanupLoginLogsSince(app, since);
    await app.close();
  }
});

test('GET /api/auth/me without cookie returns 401', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });
    assert.equal(res.statusCode, 401);
  } finally {
    await app.close();
  }
});

test('login with correct credentials sets cookie and /me succeeds', async () => {
  const app = await buildApp();
  const since = new Date();
  try {
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    assert.equal(loginRes.statusCode, 200);

    const cookie = loginRes.cookies.find((c) => c.name === 'wp_session');
    assert.ok(cookie, '登录响应应包含 wp_session cookie');

    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie: `wp_session=${cookie!.value}` },
    });
    assert.equal(meRes.statusCode, 200);
    assert.equal(meRes.json().data.email, ADMIN_EMAIL);
  } finally {
    await cleanupLoginLogsSince(app, since);
    await app.close();
  }
});
