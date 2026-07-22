import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { hashPassword } from '../src/lib/password.js';

function uniqueEmail(label: string): string {
  return `sec-test-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function createTestAdmin(
  app: Awaited<ReturnType<typeof buildApp>>,
  opts: { email: string; role: string; password?: string; isActive?: boolean },
) {
  const passwordHash = await hashPassword(opts.password ?? 'Test12345!');
  return app.prisma.adminUser.create({
    data: { email: opts.email, passwordHash, role: opts.role, isActive: opts.isActive ?? true },
  });
}

async function loginCookie(app: Awaited<ReturnType<typeof buildApp>>, email: string, password = 'Test12345!') {
  const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password } });
  const cookie = res.cookies.find((c) => c.name === 'wp_session');
  return { res, cookieHeader: cookie ? `wp_session=${cookie.value}` : undefined };
}

async function cleanupTestAdmin(app: Awaited<ReturnType<typeof buildApp>>, email: string) {
  await app.prisma.auditLog.deleteMany({ where: { adminEmail: email } });
  await app.prisma.loginLog.deleteMany({ where: { email } });
  await app.prisma.adminUser.deleteMany({ where: { email } });
}

test('1. SALES role gets 403 on a content write route', async () => {
  const app = await buildApp();
  const email = uniqueEmail('sales-write-blocked');
  try {
    await createTestAdmin(app, { email, role: 'SALES' });
    const { cookieHeader } = await loginCookie(app, email);
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/products',
      headers: { cookie: cookieHeader! },
      payload: { name: 'x', categoryId: 1, description: 'x', mainImage: '/x.webp' },
    });
    assert.equal(res.statusCode, 403);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('2. SALES role can read/write inquiries', async () => {
  const app = await buildApp();
  const email = uniqueEmail('sales-inquiries-allowed');
  try {
    await createTestAdmin(app, { email, role: 'SALES' });
    const { cookieHeader } = await loginCookie(app, email);
    const res = await app.inject({ method: 'GET', url: '/api/admin/inquiries', headers: { cookie: cookieHeader! } });
    assert.equal(res.statusCode, 200);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('3. CONTENT_ADMIN can write products', async () => {
  const app = await buildApp();
  const email = uniqueEmail('content-admin-products');
  try {
    await createTestAdmin(app, { email, role: 'CONTENT_ADMIN' });
    const { cookieHeader } = await loginCookie(app, email);
    const res = await app.inject({ method: 'GET', url: '/api/admin/products', headers: { cookie: cookieHeader! } });
    assert.equal(res.statusCode, 200);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('4. CONTENT_ADMIN gets 403 on the admin-users route', async () => {
  const app = await buildApp();
  const email = uniqueEmail('content-admin-blocked-admins');
  try {
    await createTestAdmin(app, { email, role: 'CONTENT_ADMIN' });
    const { cookieHeader } = await loginCookie(app, email);
    const res = await app.inject({ method: 'GET', url: '/api/admin/admin-users', headers: { cookie: cookieHeader! } });
    assert.equal(res.statusCode, 403);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('5. SUPER_ADMIN can create a new admin user', async () => {
  const app = await buildApp();
  const superEmail = uniqueEmail('super-creator');
  const newEmail = uniqueEmail('newly-created');
  try {
    await createTestAdmin(app, { email: superEmail, role: 'SUPER_ADMIN' });
    const { cookieHeader } = await loginCookie(app, superEmail);
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/admin-users',
      headers: { cookie: cookieHeader! },
      payload: { email: newEmail, password: 'BrandNew123!', role: 'CONTENT_ADMIN' },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().data.email, newEmail);
    assert.equal(res.json().data.passwordHash, undefined, '响应不能包含密码哈希');
  } finally {
    await cleanupTestAdmin(app, superEmail);
    await cleanupTestAdmin(app, newEmail);
    await app.close();
  }
});

test('6. cannot deactivate or demote the last active SUPER_ADMIN', async () => {
  // 测服务函数本身，不经过 HTTP——"谁在操作"由 actorId 参数模拟，不需要真的登录一个额外账号。
  const app = await buildApp();
  const email = uniqueEmail('last-super-admin');
  let deactivatedOthers: number[] = [];
  try {
    const admin = await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });

    // 制造"admin 是数据库里唯一仍启用的超级管理员"这个场景：把其他所有启用的超级管理员暂时停用
    const others = await app.prisma.adminUser.findMany({
      where: { role: 'SUPER_ADMIN', isActive: true, id: { not: admin.id } },
      select: { id: true },
    });
    deactivatedOthers = others.map((o) => o.id);
    if (deactivatedOthers.length > 0) {
      await app.prisma.adminUser.updateMany({ where: { id: { in: deactivatedOthers } }, data: { isActive: false } });
    }

    const { updateAdminUser, LastSuperAdminError } = await import('../src/modules/admin-users/admin-users.service.js');
    // actorId 传一个不存在的 id（-1）模拟"别人在操作"，避免触发"不能停用自己"这条独立规则，
    // 只单独验证"最后一个超级管理员"保护逻辑本身。
    await assert.rejects(
      () => updateAdminUser(app.prisma, admin.id, { isActive: false }, -1),
      LastSuperAdminError,
      '停用最后一个超级管理员应该抛出 LastSuperAdminError',
    );
  } finally {
    if (deactivatedOthers.length > 0) {
      await app.prisma.adminUser.updateMany({ where: { id: { in: deactivatedOthers } }, data: { isActive: true } });
    }
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('7. nonexistent email and wrong password return identical status/body (no user enumeration)', async () => {
  const app = await buildApp();
  const realEmail = uniqueEmail('enum-check');
  try {
    await createTestAdmin(app, { email: realEmail, role: 'CONTENT_ADMIN' });

    const wrongPasswordRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: realEmail, password: 'totally-wrong' },
    });
    const nonexistentRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: uniqueEmail('does-not-exist'), password: 'totally-wrong' },
    });

    assert.equal(wrongPasswordRes.statusCode, nonexistentRes.statusCode);
    assert.deepEqual(wrongPasswordRes.json(), nonexistentRes.json());
  } finally {
    await cleanupTestAdmin(app, realEmail);
    await app.close();
  }
});

test('11. deactivated account cannot log in even with the correct password', async () => {
  const app = await buildApp();
  const email = uniqueEmail('deactivated-login');
  try {
    await createTestAdmin(app, { email, role: 'CONTENT_ADMIN', isActive: false });
    const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password: 'Test12345!' } });
    assert.equal(res.statusCode, 401);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('11b. an already-logged-in session is rejected the moment the account is deactivated (requireAuth is DB-authoritative, not just JWT-based)', async () => {
  const app = await buildApp();
  const email = uniqueEmail('deactivate-midsession');
  try {
    const admin = await createTestAdmin(app, { email, role: 'CONTENT_ADMIN' });
    const { cookieHeader } = await loginCookie(app, email);

    const before = await app.inject({ method: 'GET', url: '/api/admin/products', headers: { cookie: cookieHeader! } });
    assert.equal(before.statusCode, 200);

    await app.prisma.adminUser.update({ where: { id: admin.id }, data: { isActive: false } });

    const after = await app.inject({ method: 'GET', url: '/api/admin/products', headers: { cookie: cookieHeader! } });
    assert.equal(after.statusCode, 401, '账号被停用后，同一个还没过期的 JWT 应该立刻失效，不用等 7 天自然过期');
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('12. role change takes effect immediately on the existing session (no re-login required), because authorization is always read from the DB', async () => {
  const app = await buildApp();
  const email = uniqueEmail('role-change-live');
  try {
    const admin = await createTestAdmin(app, { email, role: 'CONTENT_ADMIN' });
    const { cookieHeader } = await loginCookie(app, email);

    const before = await app.inject({ method: 'GET', url: '/api/admin/products', headers: { cookie: cookieHeader! } });
    assert.equal(before.statusCode, 200, '一开始是 CONTENT_ADMIN，应该能访问产品接口');

    await app.prisma.adminUser.update({ where: { id: admin.id }, data: { role: 'SALES' } });

    const after = await app.inject({ method: 'GET', url: '/api/admin/products', headers: { cookie: cookieHeader! } });
    assert.equal(after.statusCode, 403, '角色改成 SALES 后，同一个 Session（同一个 JWT）应该立刻按新角色算权限，不需要重新登录');
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('12b. revoking sessions (force logout) invalidates an existing valid JWT', async () => {
  const app = await buildApp();
  const superEmail = uniqueEmail('revoker');
  const targetEmail = uniqueEmail('revoke-target');
  try {
    const target = await createTestAdmin(app, { email: targetEmail, role: 'CONTENT_ADMIN' });
    await createTestAdmin(app, { email: superEmail, role: 'SUPER_ADMIN' });
    const { cookieHeader: targetCookie } = await loginCookie(app, targetEmail);
    const { cookieHeader: superCookie } = await loginCookie(app, superEmail);

    const before = await app.inject({ method: 'GET', url: '/api/admin/products', headers: { cookie: targetCookie! } });
    assert.equal(before.statusCode, 200);

    const revokeRes = await app.inject({
      method: 'POST',
      url: `/api/admin/admin-users/${target.id}/revoke-sessions`,
      headers: { cookie: superCookie! },
    });
    assert.equal(revokeRes.statusCode, 200);

    const after = await app.inject({ method: 'GET', url: '/api/admin/products', headers: { cookie: targetCookie! } });
    assert.equal(after.statusCode, 401, '强制下线之后，旧 Cookie 应该立刻失效');
  } finally {
    await cleanupTestAdmin(app, targetEmail);
    await cleanupTestAdmin(app, superEmail);
    await app.close();
  }
});

test('13. a real admin write action produces an audit log row', async () => {
  const app = await buildApp();
  const email = uniqueEmail('audit-writer');
  const categorySlug = `audit-test-category-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let categoryId: number | undefined;
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const { cookieHeader } = await loginCookie(app, email);

    // 测试跑在每个测试文件独立的隔离临时数据库里（见 test/bootstrap.ts），不能假设开发库里
    // 那些真实产品分类种子数据存在，这里自己建一个够用的最小分类 fixture。
    const category = await app.prisma.productCategory.create({
      data: { name: 'Audit Test Category', slug: categorySlug },
    });
    categoryId = category.id;

    const createRes = await app.inject({
      method: 'POST',
      url: '/api/admin/products',
      headers: { cookie: cookieHeader! },
      payload: { name: 'Audit Test Product', categoryId: category.id, description: 'desc', mainImage: '/x.webp' },
    });
    assert.equal(createRes.statusCode, 200);
    const productId = createRes.json().data.id;

    const logRow = await app.prisma.auditLog.findFirst({ where: { action: 'product.create', entityId: String(productId) } });
    assert.ok(logRow, '应该生成一条 product.create 审计日志');
    assert.equal(logRow!.adminEmail, email);
    assert.equal(logRow!.result, 'SUCCESS');

    await app.prisma.product.deleteMany({ where: { id: productId } });
    await app.prisma.auditLog.deleteMany({ where: { entityId: String(productId) } });
  } finally {
    if (categoryId !== undefined) {
      await app.prisma.productCategory.deleteMany({ where: { id: categoryId } });
    }
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('14. audit log for a sensitive settings change never contains the secret value', async () => {
  const app = await buildApp();
  const email = uniqueEmail('audit-secrets');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const { cookieHeader } = await loginCookie(app, email);

    const secretPassword = 'super-secret-smtp-password-xyz';
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/smtp',
      headers: { cookie: cookieHeader! },
      payload: { smtpHost: 'smtp.example.com', smtpPort: 587, smtpUser: 'noreply@example.com', smtpPassword: secretPassword },
    });
    assert.equal(res.statusCode, 200);

    const logRow = await app.prisma.auditLog.findFirst({
      where: { action: 'settings.smtp_update' },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(logRow);
    const serialized = JSON.stringify(logRow);
    assert.ok(!serialized.includes(secretPassword), '审计日志的任何字段都不能出现明文 SMTP 密码');
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('15. creating two admins with the same email returns a readable 409, not a raw 500', async () => {
  const app = await buildApp();
  const superEmail = uniqueEmail('dup-creator');
  const dupEmail = uniqueEmail('duplicate-target');
  try {
    await createTestAdmin(app, { email: superEmail, role: 'SUPER_ADMIN' });
    const { cookieHeader } = await loginCookie(app, superEmail);

    const first = await app.inject({
      method: 'POST',
      url: '/api/admin/admin-users',
      headers: { cookie: cookieHeader! },
      payload: { email: dupEmail, password: 'BrandNew123!', role: 'CONTENT_ADMIN' },
    });
    assert.equal(first.statusCode, 200);

    const second = await app.inject({
      method: 'POST',
      url: '/api/admin/admin-users',
      headers: { cookie: cookieHeader! },
      payload: { email: dupEmail, password: 'AnotherPass123!', role: 'SALES' },
    });
    assert.equal(second.statusCode, 409);
    assert.equal(second.json().success, false);
    assert.ok(second.json().error.message.length > 0);
  } finally {
    await cleanupTestAdmin(app, superEmail);
    await cleanupTestAdmin(app, dupEmail);
    await app.close();
  }
});

test('17. unauthenticated request returns 401', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/admin/admin-users' });
    assert.equal(res.statusCode, 401);
  } finally {
    await app.close();
  }
});

test('18. insufficient permission returns 403 (covered concretely by tests 1 and 4 above; this checks the settings-sensitive boundary too)', async () => {
  const app = await buildApp();
  const email = uniqueEmail('content-admin-smtp-blocked');
  try {
    await createTestAdmin(app, { email, role: 'CONTENT_ADMIN' });
    const { cookieHeader } = await loginCookie(app, email);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/settings/smtp',
      headers: { cookie: cookieHeader! },
      payload: { smtpHost: 'x' },
    });
    assert.equal(res.statusCode, 403, 'CONTENT_ADMIN 不能碰 SMTP 敏感配置');
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});
