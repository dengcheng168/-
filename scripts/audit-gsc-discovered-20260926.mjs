import fs from 'node:fs/promises';
import path from 'node:path';

const base = 'https://koigatetech.com';
const slugs = [
  '100-gpd-5-stage-under-sink-ro-water-purifier-2',
  '1000g-under-sink-ro-water-purifier',
  '1000g-under-sink-ro-water-purifier-2',
  '100g-1000g-compact-under-sink-ro-water-purifier',
  '100g-5-stage-ro-water-purifier-with-smart-display-pressure-tank',
  '100g-800g-minimalist-under-sink-ro-water-purifier',
  '100g-800g-smart-four-cartridge-ro-water-purifier-series',
  '100g-800g-smart-ro-water-purifier-with-color-display',
  '100g-800g-smart-under-sink-ro-water-purifier',
  '100g-hot-cold-ro-water-dispenser-with-three-water-outlets',
  '100g-ro-water-purifier-with-heating-voice-control',
  '100g-under-sink-ro-water-purifier-with-pressure-tank',
  '15-inch-dual-stage-high-flow-water-filter-system',
  '20-inch-2-stage-ultrafiltration-water-purifier',
  '3-stage-100g-under-sink-ro-water-purifier-with-pressure-tank',
  '316l-stainless-steel-high-flow-whole-house-pre-filter',
  '600g-800g-compact-high-flow-tankless-ro-water-purifier',
  '800g-smart-high-flow-tankless-ro-water-purifier',
  '800g-smart-tankless-ro-water-purifier-with-advanced-display',
  'commercial-ro-water-purification-system-1200g-3600g',
  'commercial-ro-water-purification-system-800g-1600g',
  'floor-standing-hot-cold-water-dispenser-100g-400g',
  'instant-hot-water-dispenser-with-touch-screen',
  'under-sink-ro-water-purifier-400g-600g-800g',
  'under-sink-ro-water-purifier-400g-600g-800g-1200g',
];

const enOnly = [
  '100g-800g-smart-ro-water-purifier-with-tds-display',
  '400g-600g-compact-tankless-ro-water-purifier-with-tds-display',
  '600g-tankless-under-sink-ro-water-purifier',
  '600g-tankless-under-sink-ro-water-purifier-with-universal-filters',
  '800g-1200g-high-flow-tankless-ro-water-purifier',
];

const esOnly = ['5-stage-compact-ultrafiltration-water-purifier-with-backwash'];
const targets = [
  ...slugs.flatMap((slug) => [`${base}/es/products/${slug}`, `${base}/products/${slug}`]),
  ...enOnly.map((slug) => `${base}/products/${slug}`),
  ...esOnly.map((slug) => `${base}/es/products/${slug}`),
].sort();

if (targets.length !== 56) throw new Error(`Expected 56 targets, got ${targets.length}`);

const normalize = (url) => url.replace(/\/$/, '');
const text = (html, re) => (html.match(re)?.[1] || '').replace(/\s+/g, ' ').trim();
const attrs = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const absolute = (href, page) => {
  try { return new URL(href, page).href.split('#')[0]; } catch { return ''; }
};

async function get(url, redirect = 'follow') {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      redirect,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; LiMenIndexAudit/1.0; +https://koigatetech.com/)' },
      signal: AbortSignal.timeout(30000),
    });
    return { response, body: await response.text(), elapsedMs: Date.now() - started };
  } catch (error) {
    return { error: String(error), elapsedMs: Date.now() - started };
  }
}

async function pool(items, worker, concurrency = 8) {
  const result = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      result[index] = await worker(items[index], index);
    }
  }));
  return result;
}

const sitemapFetch = await get(`${base}/sitemap.xml`);
if (!sitemapFetch.response?.ok) throw new Error(`Sitemap failed: ${sitemapFetch.response?.status || sitemapFetch.error}`);
const sitemapUrls = attrs(sitemapFetch.body, /<loc>([^<]+)<\/loc>/g).map((url) => url.replaceAll('&amp;', '&'));
const sitemapSet = new Set(sitemapUrls.map(normalize));

// Crawl current sitemap pages to produce direct, reproducible internal-inlink evidence.
const sourcePages = await pool(sitemapUrls, async (url) => {
  const fetched = await get(url);
  if (!fetched.response || !fetched.response.ok || !/text\/html/i.test(fetched.response.headers.get('content-type') || '')) {
    return { url, status: fetched.response?.status || 0, links: [] };
  }
  const hrefs = attrs(fetched.body, /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)
    .map((href) => absolute(href, fetched.response.url))
    .filter((href) => href.startsWith(`${base}/`))
    .map(normalize);
  return { url, status: fetched.response.status, links: [...new Set(hrefs)] };
});

const incoming = new Map(targets.map((url) => [normalize(url), []]));
for (const source of sourcePages) {
  for (const link of source.links) {
    if (incoming.has(link)) incoming.get(link).push(source.url);
  }
}

const records = await pool(targets, async (url) => {
  const fetched = await get(url);
  const response = fetched.response;
  const html = fetched.body || '';
  const canonical = absolute(text(html, /<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i), url);
  const robots = text(html, /<meta\b[^>]*(?:name|property)=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const hreflangs = [...html.matchAll(/<link\b[^>]*rel=["'][^"']*alternate[^"']*["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi)]
    .map((m) => ({ lang: m[1], href: absolute(m[2], url) }));
  const h1 = text(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, '').trim();
  const title = text(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i).replace(/<[^>]+>/g, '').trim();
  const schemaTypes = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
  const cleanText = html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    url,
    status: response?.status || 0,
    finalUrl: response?.url || '',
    elapsedMs: fetched.elapsedMs,
    contentType: response?.headers.get('content-type') || '',
    xRobotsTag: response?.headers.get('x-robots-tag') || '',
    robots,
    indexable: response?.status === 200 && !/noindex/i.test(`${robots} ${response?.headers.get('x-robots-tag') || ''}`),
    canonical,
    selfCanonical: normalize(canonical) === normalize(url),
    hreflangCount: hreflangs.length,
    hreflangs,
    title,
    h1,
    wordCount: cleanText.split(/\s+/).filter(Boolean).length,
    productSchema: schemaTypes.includes('Product'),
    breadcrumbSchema: schemaTypes.includes('BreadcrumbList'),
    sitemap: sitemapSet.has(normalize(url)),
    internalInlinkCount: incoming.get(normalize(url))?.length || 0,
    internalInlinks: incoming.get(normalize(url)) || [],
    error: fetched.error || '',
  };
}, 8);

const summary = {
  generatedAt: new Date().toISOString(),
  gscReportUpdatedAt: '2026-09-21',
  sitemapStatus: sitemapFetch.response.status,
  sitemapUrlCount: sitemapUrls.length,
  targetCount: records.length,
  status200: records.filter((r) => r.status === 200).length,
  indexable: records.filter((r) => r.indexable).length,
  selfCanonical: records.filter((r) => r.selfCanonical).length,
  inSitemap: records.filter((r) => r.sitemap).length,
  withHreflang: records.filter((r) => r.hreflangCount >= 2).length,
  withInternalInlinks: records.filter((r) => r.internalInlinkCount > 0).length,
  withProductSchema: records.filter((r) => r.productSchema).length,
  failures: records.filter((r) => !(r.status === 200 && r.indexable && r.selfCanonical && r.sitemap && r.hreflangCount >= 2 && r.internalInlinkCount > 0)),
};

const outputDir = path.resolve('output');
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'gsc-discovered-evidence-20260926.json'), JSON.stringify({ summary, records }, null, 2));

const columns = ['url','status','finalUrl','indexable','selfCanonical','sitemap','hreflangCount','internalInlinkCount','productSchema','breadcrumbSchema','wordCount','title','h1','error'];
const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
await fs.writeFile(path.join(outputDir, 'gsc-discovered-evidence-20260926.csv'), [columns.join(','), ...records.map((row) => columns.map((key) => csvCell(row[key])).join(','))].join('\n'));
console.log(JSON.stringify(summary, null, 2));
