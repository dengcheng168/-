import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';

test('GET /api/products returns paginated published products', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/products' });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.meta);
    assert.ok(typeof body.meta.total === 'number');
  } finally {
    await app.close();
  }
});

test('GET /api/products/:slug returns 404 for unknown slug', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/products/does-not-exist-xyz' });
    assert.equal(res.statusCode, 404);
  } finally {
    await app.close();
  }
});

test('admin product routes require authentication', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/admin/products' });
    assert.equal(res.statusCode, 401);
  } finally {
    await app.close();
  }
});
