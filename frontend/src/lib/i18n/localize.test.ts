import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveLocalizedEntity, localeQueryParam, localizedTag } from './localize';

interface Sample {
  name: string;
  description: string | null;
  tags: string[];
}

test('resolveLocalizedEntity: returns source unchanged when translation is null/undefined', () => {
  const source: Sample = { name: 'English', description: 'desc', tags: ['a'] };
  assert.deepEqual(resolveLocalizedEntity(source, null, ['name']), source);
  assert.deepEqual(resolveLocalizedEntity(source, undefined, ['name']), source);
});

test('resolveLocalizedEntity: overlays a non-empty string field', () => {
  const source: Sample = { name: 'English', description: 'desc', tags: ['a'] };
  const result = resolveLocalizedEntity(source, { name: 'Español' }, ['name']);
  assert.equal(result.name, 'Español');
  assert.equal(result.description, 'desc');
});

test('resolveLocalizedEntity: falls back to source when translated string is empty or whitespace', () => {
  const source: Sample = { name: 'English', description: 'desc', tags: ['a'] };
  assert.equal(resolveLocalizedEntity(source, { name: '' }, ['name']).name, 'English');
  assert.equal(resolveLocalizedEntity(source, { name: '   ' }, ['name']).name, 'English');
});

test('resolveLocalizedEntity: falls back to source when translated field is null', () => {
  const source: Sample = { name: 'English', description: 'desc', tags: ['a'] };
  const result = resolveLocalizedEntity(source, { description: null }, ['description']);
  assert.equal(result.description, 'desc');
});

test('resolveLocalizedEntity: non-string (array/object) fields overlay wholesale when present', () => {
  const source: Sample = { name: 'English', description: 'desc', tags: ['a', 'b'] };
  const result = resolveLocalizedEntity(source, { tags: ['x'] }, ['tags']);
  assert.deepEqual(result.tags, ['x']);
});

test('resolveLocalizedEntity: only touches fields listed in the fields array', () => {
  const source: Sample = { name: 'English', description: 'desc', tags: ['a'] };
  const result = resolveLocalizedEntity(source, { name: 'Español', description: 'ES desc' }, ['name']);
  assert.equal(result.name, 'Español');
  assert.equal(result.description, 'desc');
});

test('localeQueryParam: en returns undefined (no query param, zero extra fetch cost)', () => {
  assert.equal(localeQueryParam('en'), undefined);
});

test('localeQueryParam: es returns "es"', () => {
  assert.equal(localeQueryParam('es'), 'es');
});

test('localizedTag: en produces no extra cache tag', () => {
  assert.deepEqual(localizedTag('products', 'en'), []);
});

test('localizedTag: es produces a locale-scoped cache tag', () => {
  assert.deepEqual(localizedTag('products', 'es'), ['products:es']);
});
