import assert from 'node:assert/strict';
import test from 'node:test';
import { paginatedDescription, paginatedPath, paginatedTitle } from './pagination';

test('paginatedPath keeps page one canonical on the clean archive URL', () => {
  assert.equal(paginatedPath('/products'), '/products');
  assert.equal(paginatedPath('/products', '1'), '/products');
  assert.equal(paginatedPath('/products', '0'), '/products');
  assert.equal(paginatedPath('/products', 'invalid'), '/products');
});

test('pagination metadata is unique after page one', () => {
  assert.equal(paginatedTitle('Products', '1'), 'Products');
  assert.equal(paginatedTitle('Products', '2'), 'Products - Page 2');
  assert.equal(paginatedTitle('Productos', '3', 'es'), 'Productos - Página 3');
  assert.equal(paginatedDescription('Browse products.', '2'), 'Browse products. Page 2.');
  assert.equal(paginatedDescription('Ver productos.', '2', 'es'), 'Ver productos. Página 2.');
});

test('paginatedPath gives later pages a self-referencing canonical URL', () => {
  assert.equal(paginatedPath('/products', '2'), '/products?page=2');
  assert.equal(paginatedPath('/es/products', '12'), '/es/products?page=12');
});
