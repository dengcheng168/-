import assert from 'node:assert/strict';
import { test } from 'node:test';
import { searchSite } from './search';

test('Spanish search requests locale and uses translated names with English fallback', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request) => {
    assert.match(String(url), /locale=es/);
    return new Response(JSON.stringify({ success: true, data: {
      products: [{ id: 1, name: 'Filter', slug: 'filter', mainImage: '/uploads/a.webp', galleryImages: [], translation: { name: 'Filtro' } }],
      posts: [{ id: 2, title: 'Article', coverImage: null, translation: null }],
    } }));
  });
  const result = await searchSite('Filtro', 'es');
  assert.equal(result.products[0].name, 'Filtro');
  assert.equal(result.products[0].slug, 'filter');
  assert.equal(result.posts[0].title, 'Article');
});
