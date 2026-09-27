import { PrismaClient } from '@prisma/client';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const prisma = new PrismaClient();
const execute = process.argv.includes('--execute');
const scriptDir = dirname(fileURLToPath(import.meta.url));
const patchPath = resolve(scriptDir, 'seo004-b2-geo004-content-patch-20260912.json');
const patch = JSON.parse(await readFile(patchPath, 'utf8'));

function validateText(item) {
  for (const locale of ['en', 'es']) {
    const value = item[locale];
    if (!value?.shortDescription || !value?.seoTitle || !value?.seoDescription) throw new Error(`Missing ${locale} fields for ${item.sku}`);
    if (!value.shortDescription.includes(item.sku) || !value.seoTitle.includes(item.sku)) throw new Error(`SKU missing from ${locale} copy for ${item.sku}`);
    if (value.seoTitle.length > 60) throw new Error(`SEO title too long: ${item.sku}/${locale}`);
    if (value.seoDescription.length > 165) throw new Error(`SEO description too long: ${item.sku}/${locale}`);
  }
}

const productRows = [];
for (const item of patch.products) {
  validateText(item);
  const row = await prisma.product.findUnique({ where: { sku: item.sku }, include: { translations: { where: { locale: 'es' } } } });
  if (!row || row.slug !== item.slug) throw new Error(`Product mismatch: ${item.sku}/${item.slug}`);
  if (row.translations.length !== 1) throw new Error(`Expected one Spanish translation: ${item.sku}`);
  productRows.push(row);
}

const articleRows = [];
for (const item of patch.articles) {
  const row = await prisma.blogPost.findUnique({ where: { slug: item.slug }, include: { translations: { where: { locale: 'es' } } } });
  if (!row || row.translations.length !== 1) throw new Error(`Article or Spanish translation missing: ${item.slug}`);
  articleRows.push(row);
}

const backup = {
  createdAt: new Date().toISOString(),
  products: productRows.map(({ translations, ...row }) => ({ row, es: translations[0] })),
  articles: articleRows.map(({ translations, ...row }) => ({ row, es: translations[0] })),
};

if (!execute) {
  console.log(JSON.stringify({ mode: 'dry-run', products: productRows.map(x => ({ sku: x.sku, slug: x.slug })), articles: articleRows.map(x => x.slug) }, null, 2));
} else {
  const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
  const backupPath = resolve('/app/logs', `seo004-b2-geo004-backup-${stamp}.json`);
  await mkdir(dirname(backupPath), { recursive: true });
  await writeFile(backupPath, JSON.stringify(backup, null, 2), 'utf8');

  await prisma.$transaction(async tx => {
    for (const item of patch.products) {
      const row = productRows.find(x => x.sku === item.sku);
      await tx.product.update({ where: { id: row.id }, data: item.en });
      await tx.productTranslation.update({ where: { id: row.translations[0].id }, data: { ...item.es, translationStatus: 'PUBLISHED' } });
    }
    for (const item of patch.articles) {
      const row = articleRows.find(x => x.slug === item.slug);
      const enBody = row.body.includes(item.marker) ? row.body : `${row.body}\n${item.enAppendHtml}`;
      const esRow = row.translations[0];
      const esBody = (esRow.body || '').includes(item.marker) ? esRow.body : `${esRow.body || ''}\n${item.esAppendHtml}`;
      await tx.blogPost.update({ where: { id: row.id }, data: { authorName: item.authorName, body: enBody } });
      await tx.blogPostTranslation.update({ where: { id: esRow.id }, data: { body: esBody, translationStatus: 'PUBLISHED' } });
    }
  });
  console.log(JSON.stringify({ mode: 'execute', updatedProducts: patch.products.length, updatedArticles: patch.articles.length, backupPath }, null, 2));
}

await prisma.$disconnect();
