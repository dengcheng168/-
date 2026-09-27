import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toThumbnailUrl } from './thumbnail';

describe('toThumbnailUrl', () => {
  it('uses the generated thumbnail for uploaded WebP assets', () => {
    assert.equal(toThumbnailUrl('/uploads/webp/example.webp'), '/uploads/thumbnails/example.webp');
  });

  it('leaves non-upload and external URLs unchanged', () => {
    assert.equal(toThumbnailUrl('/images/hero.webp'), '/images/hero.webp');
    assert.equal(toThumbnailUrl('https://cdn.example.com/image.webp'), 'https://cdn.example.com/image.webp');
  });
});
