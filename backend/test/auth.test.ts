import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { hashPassword } from '../src/lib/password.js';

// 这个文件曾经用真实种子超级管理员账号（ADMIN_INIT_EMAIL/ADMIN_INIT_PASSWORD）做登录测试，
// 依赖开发数据库里已有这个账号——这正是"测试依赖开发库现有数据"的反模式：现在测试跑在每个
// 测试文件独立的临时隔离数据库里（见 test/bootstrap.ts），那个真实种子账号根本不存在，
// 所以这里改成和其它测试文件一致的写法：自己创建一个随机邮箱的临时管理员，自己清理。
const PASSWORD = 'Test12345!';

function uniqueEmail(label: string): string {
  return `auth-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function createTestAdmin(app: Awaited<ReturnType<typeof buildApp>>, email: string) {
  const passwordHash = await hashPassword(PASSWORD);
  return app.prisma.adminUser.create({ data: { email, passwordHash, role: 'SUPER_ADMIN', isActive: true } });
}

async function cleanupTestAdmin(app: Awaited<ReturnType<typeof buildApp>>, email: string) {
  await app.prisma.loginLog.deleteMany({ where: { email } });
  await app.prisma.adminUser.deleteMany({ where: { email } });
}

test('login with wrong password returns 401', async () => {
  const app = await buildApp();
  const email = uniqueEmail('wrong-password');
  try {
    await createTestAdmin(app, email);
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password: 'definitely-wrong' },
    });
    assert.equal(res.statusCode, 401);
    assert.equal(res.json().success, false);
  } finally {
    await cleanupTestAdmin(app, email);
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
  const email = uniqueEmail('correct-login');
  try {
    await createTestAdmin(app, email);
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password: PASSWORD },
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
    assert.equal(meRes.json().data.email, email);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});
