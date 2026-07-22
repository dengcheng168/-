import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLocalizedPath } from './localized-path';

test('getLocalizedPath: en path -> es target prefixes with /es', () => {
  assert.equal(getLocalizedPath('/products/ro-500', 'es'), '/es/products/ro-500');
});

test('getLocalizedPath: es path -> es target is a no-op', () => {
  assert.equal(getLocalizedPath('/es/products/ro-500', 'es'), '/es/products/ro-500');
});

test('getLocalizedPath: es path -> en target strips the /es prefix', () => {
  assert.equal(getLocalizedPath('/es/products/ro-500', 'en'), '/products/ro-500');
});

test('getLocalizedPath: en path -> en target is a no-op', () => {
  assert.equal(getLocalizedPath('/products/ro-500', 'en'), '/products/ro-500');
});

test('getLocalizedPath: /es homepage <-> / homepage', () => {
  assert.equal(getLocalizedPath('/es', 'en'), '/');
  assert.equal(getLocalizedPath('/', 'es'), '/es');
});

test('getLocalizedPath: does not false-positive on paths merely starting with "es" (e.g. /essentials)', () => {
  assert.equal(getLocalizedPath('/essentials', 'en'), '/essentials');
});
