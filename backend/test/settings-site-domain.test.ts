import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { hashPassword } from '../src/lib/password.js';

// 这个文件以前在每个用例的 finally 里把 SiteSetting.siteBaseUrl 强制重置为 null，防止某个
// 用例的写入泄漏到"后面其它用例或整个测试套件之外的状态"——但那个"套件之外的状态"说的就是
// 开发数据库，说明这些测试当时其实是连到真实开发库跑的，这正是"跑完 npm test 后正式域名被清空"
// 的直接原因。现在每个测试文件都运行在独立的临时隔离数据库里（见 test/bootstrap.ts），
// 那个数据库在这个进程退出后整个被删除，不再需要，也不应该再手工把某个字段重置回 null。
function uniqueEmail(label: string): string {
  return `site-domain-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function createTestAdmin(app: Awaited<ReturnType<typeof buildApp>>, opts: { email: string; role: string }) {
  const passwordHash = await hashPassword('Test12345!');
  return app.prisma.adminUser.create({ data: { email: opts.email, passwordHash, role: opts.role, isActive: true } });
}

async function loginCookie(app: Awaited<ReturnType<typeof buildApp>>, email: string) {
  const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password: 'Test12345!' } });
  const cookie = res.cookies.find((c) => c.name === 'wp_session');
  return cookie ? `wp_session=${cookie.value}` : undefined;
}

async function cleanupTestAdmin(app: Awaited<ReturnType<typeof buildApp>>, email: string) {
  await app.prisma.auditLog.deleteMany({ where: { adminEmail: email } });
  await app.prisma.loginLog.deleteMany({ where: { email } });
  await app.prisma.adminUser.deleteMany({ where: { email } });
}

test('1. SUPER_ADMIN can save a valid siteBaseUrl', async () => {
  const app = await buildApp();
  const email = uniqueEmail('super-save');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com' },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().data.siteBaseUrl, 'https://koigatetech.com');
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('2. CONTENT_ADMIN gets 403 saving siteBaseUrl', async () => {
  const app = await buildApp();
  const email = uniqueEmail('content-admin-blocked');
  try {
    await createTestAdmin(app, { email, role: 'CONTENT_ADMIN' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com' },
    });
    assert.equal(res.statusCode, 403);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('3. SALES gets 403 saving siteBaseUrl', async () => {
  const app = await buildApp();
  const email = uniqueEmail('sales-blocked');
  try {
    await createTestAdmin(app, { email, role: 'SALES' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com' },
    });
    assert.equal(res.statusCode, 403);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('4. unauthenticated request is rejected', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      payload: { siteBaseUrl: 'https://koigatetech.com' },
    });
    assert.equal(res.statusCode, 401);
  } finally {
    await app.close();
  }
});

test('5. saving normalizes a trailing slash', async () => {
  const app = await buildApp();
  const email = uniqueEmail('trailing-slash');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com/' },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().data.siteBaseUrl, 'https://koigatetech.com');
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('6. a URL with a path is rejected with 400', async () => {
  const app = await buildApp();
  const email = uniqueEmail('reject-path');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com/products' },
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().success, false);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('7. a URL with query parameters is rejected with 400', async () => {
  const app = await buildApp();
  const email = uniqueEmail('reject-query');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com?x=1' },
    });
    assert.equal(res.statusCode, 400);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('8. a URL with a hash is rejected with 400', async () => {
  const app = await buildApp();
  const email = uniqueEmail('reject-hash');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com#section' },
    });
    assert.equal(res.statusCode, 400);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('9. a URL with credentials is rejected with 400', async () => {
  const app = await buildApp();
  const email = uniqueEmail('reject-credentials');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://user:pass@koigatetech.com' },
    });
    assert.equal(res.statusCode, 400);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('10. a javascript: scheme is rejected with 400', async () => {
  const app = await buildApp();
  const email = uniqueEmail('reject-js-scheme');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'javascript:alert(1)' },
    });
    assert.equal(res.statusCode, 400);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('11. a valid save is rejected if invalid, and rejection never overwrites the previously-saved value', async () => {
  const app = await buildApp();
  const email = uniqueEmail('reject-does-not-overwrite');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com' },
    });
    const rejectedRes = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'not-a-valid-url' },
    });
    assert.equal(rejectedRes.statusCode, 400);

    const stillGood = await app.prisma.siteSetting.findUnique({ where: { id: 1 } });
    assert.equal(stillGood?.siteBaseUrl, 'https://koigatetech.com', '一次失败的保存不应该把之前有效的值覆盖掉');
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('12. dev/test environment (NODE_ENV != production) allows http://localhost as siteBaseUrl', async () => {
  const app = await buildApp();
  const email = uniqueEmail('dev-localhost-allowed');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'http://localhost:3000' },
    });
    assert.equal(res.statusCode, 200, '测试环境 NODE_ENV 不是 production，localhost 应该被放行（生产环境拒绝的规则见 site-url.test.ts 的单元测试）');
    assert.equal(res.json().data.siteBaseUrl, 'http://localhost:3000');
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('13. a successful save writes an audit log with before/after values', async () => {
  const app = await buildApp();
  const email = uniqueEmail('audit-log');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com' },
    });
    assert.equal(res.statusCode, 200);

    const logRow = await app.prisma.auditLog.findFirst({
      where: { action: 'settings.site_domain_update', adminEmail: email },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(logRow, '应该生成一条 settings.site_domain_update 审计日志');
    assert.ok(logRow!.afterData?.includes('koigatetech.com'));
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('14. GET /settings/public includes siteBaseUrl', async () => {
  const app = await buildApp();
  const email = uniqueEmail('public-includes');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com' },
    });

    const publicRes = await app.inject({ method: 'GET', url: '/api/settings/public' });
    assert.equal(publicRes.statusCode, 200);
    assert.equal(publicRes.json().data.siteBaseUrl, 'https://koigatetech.com');
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('15. GET /settings/public never returns SMTP/Turnstile secrets', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/settings/public' });
    assert.equal(res.statusCode, 200);
    const data = res.json().data;
    assert.equal(data.smtpPassword, undefined);
    assert.equal(data.turnstileSecretKey, undefined);
    assert.equal(data.smtpHost, undefined);
  } finally {
    await app.close();
  }
});

test('16. clearing siteBaseUrl (empty string) sets it back to null', async () => {
  const app = await buildApp();
  const email = uniqueEmail('clear-value');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);
    await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: 'https://koigatetech.com' },
    });
    const clearRes = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/site-domain',
      headers: { cookie: cookie! },
      payload: { siteBaseUrl: '' },
    });
    assert.equal(clearRes.statusCode, 200);
    assert.equal(clearRes.json().data.siteBaseUrl, null);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});
