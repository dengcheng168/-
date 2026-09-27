import { test } from 'node:test';
import assert from 'node:assert/strict';
import { excludeSitemapRedirects } from './sitemap-redirects';

test('removes redirect sources and their hreflang references without dropping valid counterparts', async () => {
  const en = 'https://example.com/blog/article';
  const es = 'https://example.com/es/blog/article';
  const languages = { en, es, 'x-default': en };
  const entries = [en, es].map((url) => ({ url, alternates: { languages } }));
  const filtered = await excludeSitemapRedirects(entries, async (paths) => paths.map((path) => ({
    path, redirect: path.startsWith('/es/') ? { toPath: '/es/blog', statusCode: 301 } : null,
  })));
  assert.deepEqual(filtered, [{ url: en, alternates: { languages: { en, 'x-default': en } } }]);
  assert.deepEqual(entries[0].alternates.languages, languages);
});

test('checks duplicate paths once, handles temporary redirects, and fails on resolver outages', async () => {
  const seen: string[] = [];
  const entries = ['https://example.com/old', 'https://example.com/old?page=2', 'https://example.com/new'].map((url) => ({ url }));
  assert.deepEqual(await excludeSitemapRedirects(entries, async (paths) => {
    seen.push(...paths);
    return paths.map((path) => ({ path, redirect: path === '/old' ? { toPath: '/new', statusCode: 302 } : null }));
  }), [{ url: 'https://example.com/new' }]);
  assert.deepEqual(seen.sort(), ['/new', '/old']);
  await assert.rejects(excludeSitemapRedirects(entries, async () => { throw new Error('backend unavailable'); }), /backend unavailable/);
});

test('uses one API request for 140 paths and bounded batches as the sitemap grows', async (t) => {
  const batches: string[][] = [];
  t.mock.method(globalThis, 'fetch', async (_url: unknown, options?: RequestInit) => {
    const paths = JSON.parse(String(options?.body)).paths as string[];
    batches.push(paths);
    return new Response(JSON.stringify({ success: true, data: paths.map((path) => ({ path, redirect: null })) }));
  });
  const entries = Array.from({ length: 401 }, (_, i) => ({ url: `https://example.com/products/p${i}` }));
  assert.equal((await excludeSitemapRedirects(entries.slice(0, 140))).length, 140);
  assert.deepEqual(batches.map((batch) => batch.length), [140]);
  batches.length = 0;
  assert.equal((await excludeSitemapRedirects(entries)).length, 401);
  assert.deepEqual(batches.map((batch) => batch.length), [200, 200, 1]);
  await assert.rejects(excludeSitemapRedirects(entries, async () => []), /Incomplete/);
});
