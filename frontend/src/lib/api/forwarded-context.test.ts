import assert from 'node:assert/strict';
import { test } from 'node:test';
import { forwardedContext } from './forwarded-context';

test('client IP forwarding is opt-in and preserves the trusted proxy chain', () => {
  const headers = new Headers({ 'x-forwarded-for': '203.0.113.1, 198.51.100.2, 172.20.0.2', 'user-agent': 'test' });
  assert.deepEqual(forwardedContext(headers, false), { 'user-agent': 'test' });
  assert.equal(forwardedContext(headers, true)['x-forwarded-for'], '203.0.113.1, 198.51.100.2, 172.20.0.2');
});

test('rejects malformed chains and limits untrusted header size', () => {
  for (const value of ['unknown', '1.2.3.4,', '1.2.3.4:80', Array(17).fill('1.2.3.4').join(',')]) {
    assert.equal(forwardedContext(new Headers({ 'x-forwarded-for': value }), true)['x-forwarded-for'], undefined);
  }
  assert.equal(forwardedContext(new Headers({ 'user-agent': 'x'.repeat(600) }), true)['user-agent'].length, 512);
  assert.equal(forwardedContext(new Headers({ 'x-forwarded-for': '2001:db8::1' }), true)['x-forwarded-for'], '2001:db8::1');
});
