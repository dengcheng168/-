import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PrismaClient } from '@prisma/client';
import { createRedirect, resolvePublicRedirect, resolvePublicRedirectBatch } from '../src/modules/redirects/redirects.service.js';
import { createRedirectSchema } from '../src/modules/redirects/redirects.schema.js';

function database(rows: Record<string, { toPath: string; statusCode: number }>) {
  return { redirect: { findUnique: async ({ where }: { where: { fromPath: string } }) => rows[where.fromPath] ?? null } } as unknown as PrismaClient;
}

test('resolves exact redirect chains and preserves temporary status', async () => {
  const db = database({ '/a': { toPath: '/b', statusCode: 301 }, '/b': { toPath: '/c', statusCode: 302 } });
  assert.deepEqual(await resolvePublicRedirect(db, '/a'), { toPath: '/c', statusCode: 302 });
  assert.equal(await resolvePublicRedirect(db, '/missing'), null);
});

test('batch lookup matches individual resolution with bounded database reads', async () => {
  const rows = {
    '/a': { toPath: '/b', statusCode: 301 },
    '/b': { toPath: '/target', statusCode: 302 },
    '/cycle': { toPath: '/cycle', statusCode: 301 },
    '/unsafe': { toPath: '//evil.example', statusCode: 301 },
  };
  let reads = 0;
  const db = { redirect: { findMany: async ({ where }: { where: { fromPath: { in: string[] } } }) => {
    reads++;
    return Object.entries(rows).filter(([key]) => where.fromPath.in.includes(key)).map(([fromPath, rule]) => ({ fromPath, ...rule }));
  } } } as unknown as PrismaClient;
  const paths = [...Object.keys(rows), '/products/qw-ro-600g-k01', ...Array.from({ length: 140 }, (_, i) => `/missing-${i}`)];
  const result = await resolvePublicRedirectBatch(db, paths);
  for (const item of result) assert.deepEqual(item.redirect, await resolvePublicRedirect(database(rows), item.path));
  assert.ok(reads <= 3, `unexpected database reads: ${reads}`);
});

test('rejects unsafe targets, self redirects and cycles', async () => {
  for (const toPath of ['//evil.example', 'https://evil.example', '/api/auth', '/a/../b', '/a?x=1', '/%2f%2fevil.example']) {
    assert.equal(createRedirectSchema.safeParse({ fromPath: '/a', toPath }).success, false);
    assert.equal(await resolvePublicRedirect(database({ '/a': { toPath, statusCode: 301 } }), '/a'), null);
  }
  for (const rows of [
    { '/a': { toPath: '/a', statusCode: 301 } },
    { '/a': { toPath: '/b', statusCode: 301 }, '/b': { toPath: '/a', statusCode: 301 } },
  ]) assert.equal(await resolvePublicRedirect(database(rows), '/a'), null);
  await assert.rejects(createRedirect(database({}), { fromPath: '/a', toPath: '/a' }), /循环/);
});

test('public redirect lookup returns only the resolved target and keeps admin routes private', async () => {
  const { buildApp } = await import('../src/app.js');
  const app = await buildApp();
  try {
    await createRedirect(app.prisma, { fromPath: '/legacy-page', toPath: '/contact', statusCode: 302 });
    const response = await app.inject({ method: 'GET', url: '/api/redirects/resolve?path=%2Flegacy-page' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json().data, { toPath: '/contact', statusCode: 302 });
    const batch = await app.inject({ method: 'POST', url: '/api/redirects/resolve-batch', payload: { paths: ['/legacy-page', '/absent'] } });
    assert.equal(batch.statusCode, 200);
    assert.deepEqual(batch.json().data, [
      { path: '/legacy-page', redirect: { toPath: '/contact', statusCode: 302 } },
      { path: '/absent', redirect: null },
    ]);
    for (const paths of [[], Array(201).fill('/legacy-page'), ['//evil.example']]) {
      assert.equal((await app.inject({ method: 'POST', url: '/api/redirects/resolve-batch', payload: { paths } })).statusCode, 400);
    }
    assert.equal((await app.inject({ method: 'GET', url: '/api/admin/redirects' })).statusCode, 401);
    await assert.rejects(createRedirect(app.prisma, { fromPath: '/contact', toPath: '/legacy-page' }), /循环/);
  } finally { await app.close(); }
});
