import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { hashPassword } from '../src/lib/password.js';

function uniqueEmail(label: string): string {
  return `page-views-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
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
  await app.prisma.adminUser.deleteMany({ where: { email } });
}

test('POST /api/page-views records a view and returns ok without requiring auth', async () => {
  const app = await buildApp();
  try {
    const before = await app.prisma.pageView.count();
    const res = await app.inject({ method: 'POST', url: '/api/page-views', payload: { path: '/products' } });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().success, true);
    const after = await app.prisma.pageView.count();
    assert.equal(after, before + 1);
  } finally {
    await app.prisma.pageView.deleteMany({ where: { path: '/products' } });
    await app.close();
  }
});

test('POST /api/page-views never errors out on a malformed body (best-effort, always returns ok)', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'POST', url: '/api/page-views', payload: { path: '' } });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().data.recorded, true);
  } finally {
    await app.close();
  }
});

test('GET /api/admin/page-views requires authentication', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/admin/page-views' });
    assert.equal(res.statusCode, 401);
  } finally {
    await app.close();
  }
});

test('GET /api/admin/page-views returns a total count in meta that reflects recorded views', async () => {
  const app = await buildApp();
  const email = uniqueEmail('list');
  try {
    await createTestAdmin(app, { email, role: 'SUPER_ADMIN' });
    const cookie = await loginCookie(app, email);

    await app.inject({ method: 'POST', url: '/api/page-views', payload: { path: '/es/products' } });
    await app.inject({ method: 'POST', url: '/api/page-views', payload: { path: '/es/products' } });

    const res = await app.inject({ method: 'GET', url: '/api/admin/page-views?pageSize=1', headers: { cookie: cookie! } });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.ok(typeof body.meta.total === 'number');
    assert.ok(body.meta.total >= 2);
  } finally {
    await app.prisma.pageView.deleteMany({ where: { path: '/es/products' } });
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});

test('GET /api/admin/page-views is rejected for SALES (below CONTENT_ROLES)', async () => {
  const app = await buildApp();
  const email = uniqueEmail('sales-blocked');
  try {
    await createTestAdmin(app, { email, role: 'SALES' });
    const cookie = await loginCookie(app, email);
    const res = await app.inject({ method: 'GET', url: '/api/admin/page-views', headers: { cookie: cookie! } });
    assert.equal(res.statusCode, 403);
  } finally {
    await cleanupTestAdmin(app, email);
    await app.close();
  }
});
