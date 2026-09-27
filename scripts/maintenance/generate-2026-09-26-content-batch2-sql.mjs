import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'output', 'seo-content-batch-2-2026-09-26.md');
const outputPath = path.join(root, 'scripts', 'maintenance', '2026-09-26-content-batch2.sql');
const source = fs.readFileSync(sourcePath, 'utf8');

const slugs = {
  1: 'how-to-select-a-100-gpd-ro-water-purifier',
  2: 'oem-vs-odm-vs-private-label-water-purifiers',
  3: 'how-to-verify-water-purifier-certificates',
};

function sql(value) {
  return `'${String(value ?? '').replaceAll("'", "''")}'`;
}

function inline(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function markdownToHtml(markdown) {
  const lines = markdown.trim().split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let inList = false;
  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${inline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (inList) out.push('</ul>');
    inList = false;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushParagraph(); closeList(); continue; }
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph(); closeList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const item = line.match(/^[-*]\s+(.+)$/);
    if (item) {
      flushParagraph();
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${inline(item[1])}</li>`);
      continue;
    }
    closeList();
    paragraph.push(line);
  }
  flushParagraph(); closeList();
  return out.join('\n');
}

function parseDraft(number, language) {
  const label = language === 'en' ? 'English' : 'Español';
  const marker = `# Draft ${number} — ${label}`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing ${marker}`);
  const after = source.slice(start + marker.length);
  const end = after.search(/\n---\n/);
  const block = (end >= 0 ? after.slice(0, end) : after).trim();
  const get = (name) => {
    const match = block.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+)`));
    if (!match) throw new Error(`Missing ${name} in ${marker}`);
    return match[1].trim().replace(/^`|`$/g, '').replace(/\s{2,}$/, '');
  };
  const bodyStart = block.search(/^##\s+/m);
  if (bodyStart < 0) throw new Error(`Missing body in ${marker}`);
  return {
    title: get('Title'),
    slug: slugs[number],
    seoTitle: get('SEO title'),
    seoDescription: get('SEO description'),
    excerpt: get('Excerpt'),
    body: markdownToHtml(block.slice(bodyStart)),
  };
}

const drafts = [1, 2, 3].map((number) => ({
  number,
  en: parseDraft(number, 'en'),
  es: parseDraft(number, 'es'),
}));

const statements = ['BEGIN IMMEDIATE;'];
for (const { en, es } of drafts) {
  statements.push(`
INSERT INTO blog_posts (
  title, slug, excerpt, body, coverImage, categoryId, authorName, status,
  publishedAt, seoTitle, seoDescription, deletedAt, createdAt, updatedAt
)
SELECT
  ${sql(en.title)}, ${sql(en.slug)}, ${sql(en.excerpt)}, ${sql(en.body)}, NULL,
  (SELECT id FROM blog_categories WHERE slug = 'general' AND published = 1 LIMIT 1),
  'Li-Men Editorial Team', 'PUBLISHED',
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  ${sql(en.seoTitle)}, ${sql(en.seoDescription)}, NULL,
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  CAST(strftime('%s','now') AS INTEGER) * 1000
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = ${sql(en.slug)});`);

  statements.push(`
INSERT INTO blog_post_translations (
  postId, locale, title, excerpt, body, seoTitle, seoDescription,
  translationStatus, updatedBy, createdAt, updatedAt
)
SELECT id, 'es', ${sql(es.title)}, ${sql(es.excerpt)}, ${sql(es.body)},
  ${sql(es.seoTitle)}, ${sql(es.seoDescription)}, 'PUBLISHED', NULL,
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  CAST(strftime('%s','now') AS INTEGER) * 1000
FROM blog_posts
WHERE slug = ${sql(en.slug)}
  AND NOT EXISTS (
    SELECT 1 FROM blog_post_translations t
    WHERE t.postId = blog_posts.id AND t.locale = 'es'
  );`);
}

const relatedEn = `<h2>Related buyer guides</h2><ul><li><a href="/blog/how-to-select-a-100-gpd-ro-water-purifier">How to select a 100 GPD RO water purifier</a></li><li><a href="/blog/oem-vs-odm-vs-private-label-water-purifiers">OEM vs ODM vs private-label water purifiers</a></li><li><a href="/blog/how-to-verify-water-purifier-certificates">How to verify water purifier certificates</a></li></ul>`;
const relatedEs = `<h2>Guías relacionadas para compradores</h2><ul><li><a href="/es/blog/how-to-select-a-100-gpd-ro-water-purifier">Cómo seleccionar un purificador RO de 100 GPD</a></li><li><a href="/es/blog/oem-vs-odm-vs-private-label-water-purifiers">OEM vs ODM vs marca privada</a></li><li><a href="/es/blog/how-to-verify-water-purifier-certificates">Cómo verificar certificados de purificadores</a></li></ul>`;

statements.push(`
UPDATE blog_posts
SET body = body || ${sql(relatedEn)}, updatedAt = CAST(strftime('%s','now') AS INTEGER) * 1000
WHERE slug = 'how-to-evaluate-a-water-purifier-manufacturer'
  AND instr(body, '/blog/how-to-select-a-100-gpd-ro-water-purifier') = 0;`);

statements.push(`
UPDATE blog_post_translations
SET body = body || ${sql(relatedEs)}, updatedAt = CAST(strftime('%s','now') AS INTEGER) * 1000
WHERE locale = 'es'
  AND postId = (SELECT id FROM blog_posts WHERE slug = 'how-to-evaluate-a-water-purifier-manufacturer')
  AND instr(COALESCE(body, ''), '/es/blog/how-to-select-a-100-gpd-ro-water-purifier') = 0;`);

statements.push('COMMIT;');
fs.writeFileSync(outputPath, statements.join('\n') + '\n', 'utf8');
console.log(JSON.stringify({ outputPath, posts: drafts.length, translations: drafts.length, bytes: fs.statSync(outputPath).size }, null, 2));
