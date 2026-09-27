import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const planPath = path.join(root, 'docs', 'audits', 'seo-metadata-plan-20260910.json');
const applyPath = path.join(here, '2026-09-10-seo-metadata-apply.sql');
const rollbackPath = path.join(here, '2026-09-10-seo-metadata-rollback.sql');
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));

const q = (value) => `'${String(value).replaceAll("'", "''")}'`;
const key = (entry) => `${entry.type}:${entry.slug}:${entry.locale}`;

function resolve(entry) {
  if (entry.type === 'product' && entry.locale === 'en') {
    return { table: 'products', alias: 'e', join: '', where: `e.slug=${q(entry.slug)}` };
  }
  if (entry.type === 'product') {
    return {
      table: 'product_translations', alias: 'e',
      join: ' JOIN products p ON p.id=e.productId',
      where: `p.slug=${q(entry.slug)} AND e.locale=${q(entry.locale)}`,
    };
  }
  if (entry.type === 'category' && entry.locale === 'en') {
    return { table: 'product_categories', alias: 'e', join: '', where: `e.slug=${q(entry.slug)}` };
  }
  if (entry.type === 'category') {
    return {
      table: 'product_category_translations', alias: 'e',
      join: ' JOIN product_categories p ON p.id=e.categoryId',
      where: `p.slug=${q(entry.slug)} AND e.locale=${q(entry.locale)}`,
    };
  }
  if (entry.type === 'blog' && entry.locale === 'en') {
    return { table: 'blog_posts', alias: 'e', join: '', where: `e.slug=${q(entry.slug)}` };
  }
  if (entry.type === 'blog') {
    return {
      table: 'blog_post_translations', alias: 'e',
      join: ' JOIN blog_posts p ON p.id=e.postId',
      where: `p.slug=${q(entry.slug)} AND e.locale=${q(entry.locale)}`,
    };
  }
  throw new Error(`Unsupported plan entry: ${key(entry)}`);
}

const duplicateKeys = plan.updates.map(key).filter((value, index, all) => all.indexOf(value) !== index);
if (duplicateKeys.length) throw new Error(`Duplicate plan keys: ${duplicateKeys.join(', ')}`);

const apply = [
  '-- Generated from docs/audits/seo-metadata-plan-20260910.json.',
  '-- REVIEW ONLY. Back up the database and run on an isolated copy before production.',
  '.bail on',
  'PRAGMA foreign_keys = ON;',
  'BEGIN IMMEDIATE;',
  `CREATE TABLE IF NOT EXISTS seo_metadata_backup_20260910 (
    entityType TEXT NOT NULL,
    slug TEXT NOT NULL,
    locale TEXT NOT NULL,
    oldSeoTitle TEXT,
    oldSeoDescription TEXT,
    backedUpAt TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (entityType, slug, locale)
  );`,
];

for (const entry of plan.updates) {
  const target = resolve(entry);
  const identity = [q(entry.type), q(entry.slug), q(entry.locale)].join(', ');
  apply.push(
    `-- ${key(entry)}`,
    `INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT ${identity}, e.seoTitle, e.seoDescription FROM ${target.table} e${target.join} WHERE ${target.where};`,
  );
  const assignments = [];
  if (entry.seoTitle) assignments.push(`seoTitle=${q(entry.seoTitle)}`);
  if (entry.seoDescription) assignments.push(`seoDescription=${q(entry.seoDescription)}`);
  assignments.push("updatedAt=datetime('now')");
  apply.push(`UPDATE ${target.table} AS e SET ${assignments.join(', ')} WHERE e.id IN (SELECT e.id FROM ${target.table} e${target.join} WHERE ${target.where});`);
}

apply.push(
  'COMMIT;',
  "SELECT 'backup rows', COUNT(*) FROM seo_metadata_backup_20260910;",
  'PRAGMA foreign_key_check;',
  'PRAGMA integrity_check;',
  '',
);

const rollback = [
  '-- Roll back only the 2026-09-10 SEO metadata batch from its captured values.',
  '.bail on',
  'PRAGMA foreign_keys = ON;',
  'BEGIN IMMEDIATE;',
];

for (const entry of [...plan.updates].reverse()) {
  const target = resolve(entry);
  const backupWhere = `entityType=${q(entry.type)} AND slug=${q(entry.slug)} AND locale=${q(entry.locale)}`;
  rollback.push(
    `-- ${key(entry)}`,
    `UPDATE ${target.table} AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE ${backupWhere}),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE ${backupWhere}),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM ${target.table} e${target.join} WHERE ${target.where})
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE ${backupWhere});`,
  );
}

rollback.push('COMMIT;', 'PRAGMA foreign_key_check;', 'PRAGMA integrity_check;', '');

fs.writeFileSync(applyPath, apply.join('\n'), 'utf8');
fs.writeFileSync(rollbackPath, rollback.join('\n'), 'utf8');
console.log(`Generated ${path.relative(root, applyPath)} and ${path.relative(root, rollbackPath)} from ${plan.updates.length} unique entity-locale records.`);
