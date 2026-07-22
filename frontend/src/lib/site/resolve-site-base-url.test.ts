import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSiteBaseUrl, isPlausibleAbsoluteUrl, DEV_DEFAULT_SITE_URL } from './resolve-site-base-url';

test('resolveSiteBaseUrl: database value takes priority over everything else', () => {
  const result = resolveSiteBaseUrl('https://koigatetech.com', {
    SITE_URL: 'https://fallback.example.com',
    NEXT_PUBLIC_SITE_URL: 'https://legacy.example.com',
    isDevelopment: false,
  });
  assert.equal(result?.source, 'DATABASE');
  assert.equal(result?.url, 'https://koigatetech.com');
});

test('resolveSiteBaseUrl: SITE_URL is the second priority when the database has no value', () => {
  const result = resolveSiteBaseUrl(null, {
    SITE_URL: 'https://fallback.example.com',
    NEXT_PUBLIC_SITE_URL: 'https://legacy.example.com',
    isDevelopment: false,
  });
  assert.equal(result?.source, 'SITE_URL');
  assert.equal(result?.url, 'https://fallback.example.com');
});

test('resolveSiteBaseUrl: legacy NEXT_PUBLIC_SITE_URL is only used when both database and SITE_URL are absent', () => {
  const result = resolveSiteBaseUrl(null, { NEXT_PUBLIC_SITE_URL: 'https://legacy.example.com', isDevelopment: false });
  assert.equal(result?.source, 'LEGACY_NEXT_PUBLIC_SITE_URL');
  assert.equal(result?.url, 'https://legacy.example.com');
});

test('resolveSiteBaseUrl: development environment falls back to http://localhost:3000 when nothing else is configured', () => {
  const result = resolveSiteBaseUrl(null, { isDevelopment: true });
  assert.equal(result?.source, 'DEVELOPMENT_DEFAULT');
  assert.equal(result?.url, DEV_DEFAULT_SITE_URL);
});

test('resolveSiteBaseUrl: production environment returns null (not localhost) when nothing is configured', () => {
  const result = resolveSiteBaseUrl(null, { isDevelopment: false });
  assert.equal(result, null);
});

test('resolveSiteBaseUrl: an invalid database value is skipped in favor of a valid SITE_URL fallback', () => {
  const result = resolveSiteBaseUrl('not-a-valid-url', { SITE_URL: 'https://fallback.example.com', isDevelopment: false });
  assert.equal(result?.source, 'SITE_URL');
});

test('resolveSiteBaseUrl: trailing whitespace in an env value is trimmed', () => {
  const result = resolveSiteBaseUrl(null, { SITE_URL: '  https://fallback.example.com  ', isDevelopment: false });
  assert.equal(result?.url, 'https://fallback.example.com');
});

test('resolveSiteBaseUrl: a trailing slash on SITE_URL/NEXT_PUBLIC_SITE_URL is stripped (avoids double slashes)', () => {
  assert.equal(resolveSiteBaseUrl(null, { SITE_URL: 'https://fallback.example.com/', isDevelopment: false })?.url, 'https://fallback.example.com');
  assert.equal(
    resolveSiteBaseUrl(null, { NEXT_PUBLIC_SITE_URL: 'https://legacy.example.com/', isDevelopment: false })?.url,
    'https://legacy.example.com',
  );
});

test('resolveSiteBaseUrl: changing which source has a value changes the resolved URL, independent of any pathname/locale concerns', () => {
  const before = resolveSiteBaseUrl(null, { SITE_URL: 'https://old.example.com', isDevelopment: false });
  const after = resolveSiteBaseUrl('https://koigatetech.com', { SITE_URL: 'https://old.example.com', isDevelopment: false });
  assert.equal(before?.url, 'https://old.example.com');
  assert.equal(after?.url, 'https://koigatetech.com');
});

test('isPlausibleAbsoluteUrl: accepts http/https URLs, rejects everything else', () => {
  assert.equal(isPlausibleAbsoluteUrl('https://koigatetech.com'), true);
  assert.equal(isPlausibleAbsoluteUrl('http://localhost:3000'), true);
  assert.equal(isPlausibleAbsoluteUrl(null), false);
  assert.equal(isPlausibleAbsoluteUrl(undefined), false);
  assert.equal(isPlausibleAbsoluteUrl(''), false);
  assert.equal(isPlausibleAbsoluteUrl('   '), false);
  assert.equal(isPlausibleAbsoluteUrl('not a url'), false);
  assert.equal(isPlausibleAbsoluteUrl('javascript:alert(1)'), false);
});
