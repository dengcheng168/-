import { test } from 'node:test';
import assert from 'node:assert/strict';
import { overlayCategoryName } from '../src/lib/nested-category.js';

test('overlayCategoryName overlays name when translation is present and non-empty', () => {
  const category = { id: 1, name: 'Reverse Osmosis Systems', description: 'English desc' };
  const result = overlayCategoryName(category, { name: 'Sistemas de Ósmosis Inversa', description: 'Desc ES' });
  assert.equal(result.name, 'Sistemas de Ósmosis Inversa');
  assert.equal(result.description, 'Desc ES');
});

test('overlayCategoryName falls back to English when translation is undefined', () => {
  const category = { id: 1, name: 'Reverse Osmosis Systems' };
  const result = overlayCategoryName(category, undefined);
  assert.equal(result.name, 'Reverse Osmosis Systems');
});

test('overlayCategoryName falls back to English when translation name is empty/whitespace', () => {
  const category = { id: 1, name: 'Reverse Osmosis Systems' };
  const result = overlayCategoryName(category, { name: '   ' });
  assert.equal(result.name, 'Reverse Osmosis Systems');
});

test('overlayCategoryName falls back to English when translation name is null', () => {
  const category = { id: 1, name: 'Reverse Osmosis Systems' };
  const result = overlayCategoryName(category, { name: null });
  assert.equal(result.name, 'Reverse Osmosis Systems');
});

test('overlayCategoryName does not mutate the original category object', () => {
  const category = { id: 1, name: 'Reverse Osmosis Systems' };
  overlayCategoryName(category, { name: 'Sistemas de Ósmosis Inversa' });
  assert.equal(category.name, 'Reverse Osmosis Systems');
});

test('overlayCategoryName leaves description untouched when category has no description field', () => {
  const category = { id: 1, name: 'RO Systems' };
  const result = overlayCategoryName(category, { name: 'Sistemas RO', description: 'should be ignored' });
  assert.equal(result.name, 'Sistemas RO');
  assert.equal('description' in result, false);
});
