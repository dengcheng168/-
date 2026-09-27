import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBlogPostBySlug } from './blog';
import { ApiError } from './client';

test('only an upstream 404 is treated as a missing blog post', async (t) => {
  let status = 404;
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({
    success: false,
    error: { message: 'upstream test error' },
  }), { status }));

  for (const locale of ['en', 'es'] as const) {
    status = 404;
    assert.equal(await getBlogPostBySlug('existing-post', locale), null);

    for (status of [429, 500, 503]) {
      await assert.rejects(
        getBlogPostBySlug('existing-post', locale),
        (error: unknown) => error instanceof ApiError && error.status === status,
      );
    }
  }
});

test('network failures do not become blog not-found results', async (t) => {
  const failure = new TypeError('simulated connection failure');
  t.mock.method(globalThis, 'fetch', async () => { throw failure; });
  await assert.rejects(getBlogPostBySlug('existing-post'), (error: unknown) => error === failure);
});
