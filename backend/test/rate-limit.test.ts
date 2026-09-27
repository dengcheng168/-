import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';

test('trusted internal SSR reads do not exhaust the global rate-limit bucket', async () => {
  const app = await buildApp();
  try {
    for (let index = 0; index < 320; index += 1) {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
        remoteAddress: '172.18.0.3',
      });
      assert.equal(response.statusCode, 200);
    }
  } finally {
    await app.close();
  }
});

test('public clients remain rate limited and receive Retry-After', async () => {
  const app = await buildApp();
  try {
    let response;
    for (let index = 0; index < 301; index += 1) {
      response = await app.inject({
        method: 'GET',
        url: '/api/health',
        remoteAddress: '203.0.113.10',
      });
    }

    assert.equal(response?.statusCode, 429);
    assert.match(response?.headers['retry-after'] ?? '', /^\d+$/);
    assert.equal(response?.json().error.code, 'RATE_LIMITED');
  } finally {
    await app.close();
  }
});

test('trusted internal write requests are not globally allow-listed', async () => {
  const app = await buildApp();
  try {
    let response;
    for (let index = 0; index < 301; index += 1) {
      response = await app.inject({
        method: 'POST',
        url: '/api/page-views',
        remoteAddress: '172.18.0.3',
        payload: { path: '/' },
      });
    }
    assert.equal(response?.statusCode, 429);
  } finally {
    await app.close();
  }
});
