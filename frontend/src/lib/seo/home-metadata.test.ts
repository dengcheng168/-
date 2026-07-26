import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveHomeSeoMetadata } from './home-metadata';

test('resolveHomeSeoMetadata: Spanish title and description both present use the translated values', () => {
  const result = resolveHomeSeoMetadata({
    translations: { 'seo.home.title': 'Título ES', 'seo.home.description': 'Descripción ES' },
    defaultSeoTitle: 'English Title',
    defaultSeoDescription: 'English Description',
  });
  assert.equal(result.title, 'Título ES');
  assert.equal(result.description, 'Descripción ES');
});

test('resolveHomeSeoMetadata: missing Spanish title falls back to the English default', () => {
  const result = resolveHomeSeoMetadata({
    translations: { 'seo.home.description': 'Descripción ES' },
    defaultSeoTitle: 'English Title',
    defaultSeoDescription: 'English Description',
  });
  assert.equal(result.title, 'English Title');
  assert.equal(result.description, 'Descripción ES');
});

test('resolveHomeSeoMetadata: missing Spanish description falls back to the English default', () => {
  const result = resolveHomeSeoMetadata({
    translations: { 'seo.home.title': 'Título ES' },
    defaultSeoTitle: 'English Title',
    defaultSeoDescription: 'English Description',
  });
  assert.equal(result.title, 'Título ES');
  assert.equal(result.description, 'English Description');
});

test('resolveHomeSeoMetadata: empty/whitespace Spanish values fall back to the English default', () => {
  const result = resolveHomeSeoMetadata({
    translations: { 'seo.home.title': '', 'seo.home.description': '   ' },
    defaultSeoTitle: 'English Title',
    defaultSeoDescription: 'English Description',
  });
  assert.equal(result.title, 'English Title');
  assert.equal(result.description, 'English Description');
});

test('resolveHomeSeoMetadata: both Spanish and English values missing resolves to undefined (omit the field)', () => {
  const result = resolveHomeSeoMetadata({
    translations: {},
    defaultSeoTitle: null,
    defaultSeoDescription: null,
  });
  assert.equal(result.title, undefined);
  assert.equal(result.description, undefined);
});

test('resolveHomeSeoMetadata: English site (no translations passed) uses the English default directly', () => {
  const result = resolveHomeSeoMetadata({
    translations: {},
    defaultSeoTitle: 'English Title',
    defaultSeoDescription: 'English Description',
  });
  assert.equal(result.title, 'English Title');
  assert.equal(result.description, 'English Description');
});
