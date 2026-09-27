import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

test('public proxy redirects exact matches, preserving query parameters', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request) => {
    assert.match(String(url), /\/api\/redirects\/resolve\?path=%2Fold$/);
    return new Response(JSON.stringify({ success: true, data: { toPath: '/contact', statusCode: 301 } }));
  });
  const result = await proxy(new NextRequest('https://example.com/old?source=test'));
  assert.equal(result.status, 301);
  assert.equal(result.headers.get('location'), 'https://example.com/contact?source=test');
});

test('proxy preserves admin protection, skips actions and tolerates lookup outage', async (t) => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; throw new Error('offline'); });
  assert.equal((await proxy(new NextRequest('https://example.com/admin'))).status, 404);
  assert.equal((await proxy(new NextRequest('https://example.com/contact', { method: 'POST' }))).status, 200);
  assert.equal((await proxy(new NextRequest('https://example.com/auth/admin/inquiries/export'))).status, 200);
  assert.equal(calls, 0);
  assert.equal((await proxy(new NextRequest('https://example.com/contact'))).status, 200);
  assert.equal(calls, 1);
});
