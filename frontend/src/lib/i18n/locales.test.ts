import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSupportedLocale, type Locale } from './locales';

/**
 * submitInquiryAction (lib/actions/inquiry.ts) 的 pageLanguage 落库逻辑就是
 * `rawLocale && isSupportedLocale(rawLocale) ? rawLocale : 'en'`——这里直接测这个判定函数。
 */
function resolveInquiryLocale(rawLocale: string | undefined): Locale {
  return rawLocale && isSupportedLocale(rawLocale) ? rawLocale : 'en';
}

test('isSupportedLocale: "es" is supported', () => {
  assert.equal(isSupportedLocale('es'), true);
});

test('isSupportedLocale: "en" is not in the SUPPORTED_LOCALES overlay list (en is the implicit default)', () => {
  assert.equal(isSupportedLocale('en'), false);
});

test('isSupportedLocale: unknown/garbage values are rejected', () => {
  assert.equal(isSupportedLocale('fr'), false);
  assert.equal(isSupportedLocale(''), false);
  assert.equal(isSupportedLocale('ES'), false);
});

test('resolveInquiryLocale: hidden form field "es" -> pageLanguage "es"', () => {
  assert.equal(resolveInquiryLocale('es'), 'es');
});

test('resolveInquiryLocale: missing/undefined/unsupported hidden field -> pageLanguage "en"', () => {
  assert.equal(resolveInquiryLocale(undefined), 'en');
  assert.equal(resolveInquiryLocale(''), 'en');
  assert.equal(resolveInquiryLocale('fr'), 'en');
});
