import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSiteBaseUrl, normalizeSiteBaseUrl } from '../src/lib/site-url.js';

test('validateSiteBaseUrl: accepts a plain https root domain', () => {
  const result = validateSiteBaseUrl('https://koigatetech.com');
  assert.equal(result.ok, true);
  assert.equal(result.value, 'https://koigatetech.com');
});

test('validateSiteBaseUrl: accepts www and arbitrary subdomains', () => {
  assert.equal(validateSiteBaseUrl('https://www.koigatetech.com').ok, true);
  assert.equal(validateSiteBaseUrl('https://shop.koigatetech.com').ok, true);
});

test('validateSiteBaseUrl: trailing slash is normalized away', () => {
  const result = validateSiteBaseUrl('https://koigatetech.com/');
  assert.equal(result.ok, true);
  assert.equal(result.value, 'https://koigatetech.com');
});

test('validateSiteBaseUrl: rejects a bare domain with no protocol', () => {
  const result = validateSiteBaseUrl('koigatetech.com');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'INVALID_URL');
});

test('validateSiteBaseUrl: rejects http:// in production mode', () => {
  const result = validateSiteBaseUrl('http://koigatetech.com', { allowLocalhost: false });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'PROTOCOL_NOT_HTTPS');
});

test('validateSiteBaseUrl: rejects a URL containing a page path', () => {
  const result = validateSiteBaseUrl('https://koigatetech.com/products');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'HAS_PATH');
});

test('validateSiteBaseUrl: rejects a URL containing query parameters', () => {
  const result = validateSiteBaseUrl('https://koigatetech.com?x=1');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'HAS_QUERY');
});

test('validateSiteBaseUrl: rejects a URL containing a hash/anchor', () => {
  const result = validateSiteBaseUrl('https://koigatetech.com#section');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'HAS_HASH');
});

test('validateSiteBaseUrl: rejects a URL containing credentials', () => {
  const result = validateSiteBaseUrl('https://user:password@koigatetech.com');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'HAS_CREDENTIALS');
});

test('validateSiteBaseUrl: rejects javascript: scheme', () => {
  const result = validateSiteBaseUrl('javascript:alert(1)');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'PROTOCOL_NOT_HTTPS');
});

test('validateSiteBaseUrl: rejects data: scheme', () => {
  const result = validateSiteBaseUrl('data:text/html,<script>alert(1)</script>');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'PROTOCOL_NOT_HTTPS');
});

test('validateSiteBaseUrl: rejects empty/whitespace-only input', () => {
  assert.equal(validateSiteBaseUrl('').error, 'EMPTY');
  assert.equal(validateSiteBaseUrl('   ').error, 'EMPTY');
});

test('validateSiteBaseUrl: rejects localhost in production mode (allowLocalhost: false)', () => {
  const result = validateSiteBaseUrl('https://localhost', { allowLocalhost: false });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'LOCALHOST_NOT_ALLOWED');
});

test('validateSiteBaseUrl: rejects 127.0.0.1 and private IP ranges in production mode', () => {
  assert.equal(validateSiteBaseUrl('https://127.0.0.1', { allowLocalhost: false }).error, 'PRIVATE_IP_NOT_ALLOWED');
  assert.equal(validateSiteBaseUrl('https://10.0.0.5', { allowLocalhost: false }).error, 'PRIVATE_IP_NOT_ALLOWED');
  assert.equal(validateSiteBaseUrl('https://192.168.1.1', { allowLocalhost: false }).error, 'PRIVATE_IP_NOT_ALLOWED');
  assert.equal(validateSiteBaseUrl('https://172.16.0.1', { allowLocalhost: false }).error, 'PRIVATE_IP_NOT_ALLOWED');
});

test('validateSiteBaseUrl: allows http://localhost[:port] when allowLocalhost is explicitly true (dev/test only)', () => {
  const result = validateSiteBaseUrl('http://localhost:3000', { allowLocalhost: true });
  assert.equal(result.ok, true);
  assert.equal(result.value, 'http://localhost:3000');
});

test('validateSiteBaseUrl: allowLocalhost does not bypass the path/query/hash/credentials rules', () => {
  assert.equal(validateSiteBaseUrl('http://localhost:3000/products', { allowLocalhost: true }).error, 'HAS_PATH');
  assert.equal(validateSiteBaseUrl('http://localhost:3000?x=1', { allowLocalhost: true }).error, 'HAS_QUERY');
});

test('normalizeSiteBaseUrl: returns the normalized value for a valid URL', () => {
  assert.equal(normalizeSiteBaseUrl('https://koigatetech.com/'), 'https://koigatetech.com');
});

test('normalizeSiteBaseUrl: returns null for an invalid URL instead of throwing', () => {
  assert.equal(normalizeSiteBaseUrl('not a url'), null);
  assert.equal(normalizeSiteBaseUrl('https://koigatetech.com/products'), null);
});
