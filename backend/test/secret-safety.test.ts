import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isWeakSecret } from '../src/lib/secret-safety.js';

test('isWeakSecret: flags the known .env.example placeholder value', () => {
  assert.equal(isWeakSecret('dev-secret-change-me'), true);
});

test('isWeakSecret: flags common weak placeholder strings', () => {
  assert.equal(isWeakSecret('secret'), true);
  assert.equal(isWeakSecret('change-me'), true);
  assert.equal(isWeakSecret('development-secret'), true);
});

test('isWeakSecret: trims surrounding whitespace before comparing', () => {
  assert.equal(isWeakSecret('  dev-secret-change-me  '), true);
});

test('isWeakSecret: does not flag a real random-looking secret', () => {
  assert.equal(isWeakSecret('f3a9c1e7b2d84f6a9c0e1b7d5a3f8c62'), false);
});

test('isWeakSecret: is case-sensitive (does not over-match unrelated strings containing "secret")', () => {
  assert.equal(isWeakSecret('this-is-not-in-the-known-weak-list'), false);
});
