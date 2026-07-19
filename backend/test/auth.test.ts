import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { env } from '../src/config/env.js';

const ADMIN_EMAIL = env.ADMIN_INIT_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = env.ADMIN_INIT_PASSWORD ?? 'change-me-please';

test('login with wrong password returns 401', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: ADMIN_EMAIL, password: 'definitely-wrong' },
    });
    assert.equal(res.statusCode, 401);
    assert.equal(res.json().success, false);
  } finally {
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
    await app.close();
  }
});
