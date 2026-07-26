import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { NextRequest } from 'next/server';
import { isSameOriginRequest } from './route';
import { ADMIN_IDLE_LOGOUT_ENDPOINT } from '@/lib/admin/admin-idle-session';

function makeRequest(headers: Record<string, string>): NextRequest {
  return new Request('http://internal.test/auth/admin/logout', {
    method: 'POST',
    headers,
  }) as unknown as NextRequest;
}

test('isSameOriginRequest: Origin 与 Host 一致时放行', () => {
  assert.equal(
    isSameOriginRequest(makeRequest({ origin: 'https://koigatetech.com', host: 'koigatetech.com' })),
    true,
  );
});

test('isSameOriginRequest: Origin 与 Host 不一致时拒绝（跨域）', () => {
  assert.equal(
    isSameOriginRequest(makeRequest({ origin: 'https://evil.example', host: 'koigatetech.com' })),
    false,
  );
});

test('isSameOriginRequest: 缺失 Origin 头时按同站放行', () => {
  assert.equal(
    isSameOriginRequest(makeRequest({ host: 'koigatetech.com' })),
    true,
  );
});

test('isSameOriginRequest: 缺失 Host 头时拒绝', () => {
  assert.equal(
    isSameOriginRequest(makeRequest({ origin: 'https://koigatetech.com' })),
    false,
  );
});

test('客户端登出常量：路径为 /auth/admin/logout', () => {
  assert.equal(ADMIN_IDLE_LOGOUT_ENDPOINT, '/auth/admin/logout');
});

test('客户端登出常量：路径不以 /api/ 开头', () => {
  assert.equal(ADMIN_IDLE_LOGOUT_ENDPOINT.startsWith('/api/'), false);
});

test('客户端登出常量：路径不以 /admin/ 开头', () => {
  assert.equal(ADMIN_IDLE_LOGOUT_ENDPOINT.startsWith('/admin/'), false);
});

test('Route Handler 源码只导出 POST，GET/PUT 交由 Next.js 自动返回 405', () => {
  const source = readFileSync(path.join(process.cwd(), 'src/app/auth/admin/logout/route.ts'), 'utf-8');
  assert.match(source, /export async function POST\(/);
  assert.doesNotMatch(source, /export (async )?function GET\(/);
  assert.doesNotMatch(source, /export (async )?function PUT\(/);
});

test('原客户端代码中不再引用 /api/admin/logout', () => {
  const source = readFileSync(path.join(process.cwd(), 'src/components/admin/AdminIdleLogout.tsx'), 'utf-8');
  assert.doesNotMatch(source, /\/api\/admin\/logout/);
});

test('旧 Route Handler 文件已不存在于 /api/admin/logout', () => {
  assert.throws(() => readFileSync(path.join(process.cwd(), 'src/app/api/admin/logout/route.ts')));
});
