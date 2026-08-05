import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getAdjacentProducts } from './product-navigation';

interface P {
  slug: string;
  categoryId: number;
}

function product(slug: string, categoryId: number): P {
  return { slug, categoryId };
}

describe('getAdjacentProducts', () => {
  it('prefers same-category neighbours over the global list', () => {
    const all = [
      product('a1', 1),
      product('b1', 2),
      product('a2', 1),
      product('b2', 2),
      product('a3', 1),
    ];
    const { prev, next } = getAdjacentProducts(product('a2', 1), all);
    assert.equal(prev?.slug, 'a1');
    assert.equal(next?.slug, 'a3');
  });

  it('falls back to the global list when the category has only the current product', () => {
    const all = [product('a1', 1), product('solo', 9), product('a2', 1)];
    const { prev, next } = getAdjacentProducts(product('solo', 9), all);
    assert.equal(prev?.slug, 'a1');
    assert.equal(next?.slug, 'a2');
  });

  it('returns no prev for the first product in its scope', () => {
    const all = [product('a1', 1), product('a2', 1)];
    const { prev, next } = getAdjacentProducts(product('a1', 1), all);
    assert.equal(prev, null);
    assert.equal(next?.slug, 'a2');
  });

  it('returns no next for the last product in its scope', () => {
    const all = [product('a1', 1), product('a2', 1)];
    const { prev, next } = getAdjacentProducts(product('a2', 1), all);
    assert.equal(prev?.slug, 'a1');
    assert.equal(next, null);
  });

  it('returns null/null when the current product is not found in the list', () => {
    const all = [product('a1', 1), product('a2', 1)];
    const { prev, next } = getAdjacentProducts(product('missing', 1), all);
    assert.equal(prev, null);
    assert.equal(next, null);
  });

  it('returns null/null for a single-product global list (no neighbours anywhere)', () => {
    const all = [product('only', 1)];
    const { prev, next } = getAdjacentProducts(product('only', 1), all);
    assert.equal(prev, null);
    assert.equal(next, null);
  });
});
