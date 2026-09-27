import fs from 'node:fs/promises';

const groups = {
  alternateCanonical: [
    'https://www.koigatetech.com/products/category/under-sink-ro-water-purifiers',
    'https://www.koigatetech.com/blog',
    'https://www.koigatetech.com/terms-of-use',
    'https://www.koigatetech.com/privacy-policy',
    'https://www.koigatetech.com/blog/tag/quality-control',
    'https://www.koigatetech.com/about',
    'https://www.koigatetech.com/certificates',
    'https://www.koigatetech.com/faq',
    'https://www.koigatetech.com/es/products',
    'https://www.koigatetech.com/es/products/category/commercial-water-purification-systems',
    'https://www.koigatetech.com/es/contact',
    'https://www.koigatetech.com/es/about',
  ],
  noindex: [
    'https://koigatetech.com/es/blog/tag/oem-water-purifier',
    'https://koigatetech.com/blog/tag/made-in-china',
    'https://koigatetech.com/blog/tag/oem-water-purifier',
    'https://koigatetech.com/es/blog/tag/odm-water-purifier',
    'https://koigatetech.com/es/blog/tag/quality-control',
    'https://koigatetech.com/blog/category/general',
    'https://koigatetech.com/es/products/category/commercial-water-purification-systems',
    'https://koigatetech.com/products/category/commercial-water-purification-systems',
  ],
  redirects: [
    'https://www.koigatetech.com/',
    'https://koigatetech.com/es/products/category/whole-house-ultrafiltration-systems',
    'http://koigatetech.com/',
    'http://www.koigatetech.com/',
  ],
  crawledNotIndexed: [
    'https://koigatetech.com/products/100g-countertop-ro-water-purifier-with-touchscreen-temperature-control',
    'https://koigatetech.com/products/100g-800g-smart-ro-water-purifier-with-color-display-tds-monitoring',
    'https://koigatetech.com/favicon.ico?favicon.2vob68tjqpejf.ico',
    'https://koigatetech.com/favicon.ico',
  ],
  soft404: ['https://koigatetech.com/es/blog/category/company-news'],
};

const normalize = (u) => u.replace(/\/$/, '');
const tag = (html, re) => (html.match(re)?.[1] || '').replace(/\s+/g, ' ').trim();
async function inspect(group, url) {
  const chain = [];
  let current = url;
  let response;
  for (let i = 0; i < 8; i++) {
    response = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(30000), headers: { 'user-agent': 'Mozilla/5.0 (compatible; LiMenIndexAudit/1.0)' } });
    const location = response.headers.get('location');
    chain.push({ url: current, status: response.status, location: location ? new URL(location, current).href : '' });
    if (!location || response.status < 300 || response.status >= 400) break;
    current = new URL(location, current).href;
  }
  const body = await response.text();
  const canonicalRaw = tag(body, /<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  const canonical = canonicalRaw ? new URL(canonicalRaw, current).href : '';
  const robots = tag(body, /<meta\b[^>]*(?:name|property)=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return {
    group, url, chain, finalStatus: response.status, finalUrl: current,
    canonical, selfCanonical: canonical ? normalize(canonical) === normalize(current) : false,
    robots, xRobotsTag: response.headers.get('x-robots-tag') || '',
    title: tag(body, /<title\b[^>]*>([\s\S]*?)<\/title>/i).replace(/<[^>]+>/g, ''),
  };
}

const entries = Object.entries(groups).flatMap(([group, urls]) => urls.map((url) => ({ group, url })));
const records = [];
for (let i = 0; i < entries.length; i += 8) {
  records.push(...await Promise.all(entries.slice(i, i + 8).map(({ group, url }) => inspect(group, url))));
}
const summary = Object.fromEntries(Object.keys(groups).map((group) => [group, records.filter((r) => r.group === group).length]));
await fs.mkdir('output', { recursive: true });
await fs.writeFile('output/gsc-exclusions-evidence-20260926.json', JSON.stringify({ generatedAt: new Date().toISOString(), summary, records }, null, 2));
console.log(JSON.stringify({ summary, records }, null, 2));
