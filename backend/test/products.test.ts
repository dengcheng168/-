import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';

test('GET /api/products returns paginated published products', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/products' });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.meta);
    assert.ok(typeof body.meta.total === 'number');
  } finally {
    await app.close();
  }
});

test('GET /api/products/:slug returns 404 for unknown slug', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/products/does-not-exist-xyz' });
    assert.equal(res.statusCode, 404);
  } finally {
    await app.close();
  }
});

test('admin product routes require authentication', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/admin/products' });
    assert.equal(res.statusCode, 401);
  } finally {
    await app.close();
  }
});

test('public product gallery uses media-library Alt text when product Alt is blank', async () => {
  const app = await buildApp();
  try {
    const category = await app.prisma.productCategory.create({ data: { name: 'Alt test', slug: 'alt-test' } });
    const mediaUrl = '/uploads/webp/gallery-alt-test.webp';
    await app.prisma.media.create({ data: {
      filename: 'gallery-alt-test.png',
      originalName: 'gallery-alt-test.png',
      url: '/uploads/originals/gallery-alt-test.png',
      webpUrl: mediaUrl,
      mimeType: 'image/png',
      size: 1,
      altText: 'Countertop water dispenser detail',
    } });
    await app.prisma.product.create({ data: {
      name: 'Gallery Alt Product',
      slug: 'gallery-alt-product',
      categoryId: category.id,
      description: '',
      mainImage: mediaUrl,
      galleryImages: JSON.stringify([
        { url: mediaUrl, alt: '' },
        { url: '/uploads/webp/custom-alt.webp', alt: 'Product-specific Alt' },
      ]),
      status: 'PUBLISHED',
    } });

    const response = await app.inject({ method: 'GET', url: '/api/products/gallery-alt-product' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json().data.product.galleryImages, [
      { url: mediaUrl, alt: 'Countertop water dispenser detail' },
      { url: '/uploads/webp/custom-alt.webp', alt: 'Product-specific Alt' },
    ]);
  } finally {
    await app.close();
  }
});

test('Spanish search matches only published translations of published products', async () => {
  const app = await buildApp();
  try {
    const category = await app.prisma.productCategory.create({ data: { name: 'Search test', slug: 'search-test' } });
    const create = (slug: string, status: string, translationStatus: string) => app.prisma.product.create({ data: {
      name: 'Water filter', slug, categoryId: category.id, description: '', mainImage: '/uploads/test.webp', status,
      translations: { create: { locale: 'es', name: 'Purificador', translationStatus } },
    } });
    const published = await create('search-published', 'PUBLISHED', 'PUBLISHED');
    await create('search-draft-translation', 'PUBLISHED', 'DRAFT');
    await create('search-draft-product', 'DRAFT', 'PUBLISHED');
    const response = await app.inject({ method: 'GET', url: '/api/search?q=Purificador&locale=es' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json().data.products.map((p: { id: number }) => p.id), [published.id]);
    assert.equal(response.json().data.products[0].translation.name, 'Purificador');
    assert.deepEqual((await app.inject({ method: 'GET', url: '/api/search?q=Purificador' })).json().data.products, []);
  } finally { await app.close(); }
});
