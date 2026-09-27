import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const execute = process.argv.includes('--execute');
const scriptDir = dirname(fileURLToPath(import.meta.url));
const patchPath = resolve(scriptDir, 'seo-004-content-patch-20260912.json');
const patch = JSON.parse(await readFile(patchPath, 'utf8'));

try {
  const skus = patch.products.map((item) => item.sku);
  const existing = await prisma.product.findMany({
    where: { sku: { in: skus }, deletedAt: null },
    include: { translations: { where: { locale: 'es' } } },
  });

  const bySku = new Map(existing.map((product) => [product.sku, product]));
  const errors = [];
  for (const item of patch.products) {
    const product = bySku.get(item.sku);
    if (!product) errors.push(`${item.sku}: product not found`);
    else if (product.slug !== item.slug) errors.push(`${item.sku}: slug mismatch (${product.slug})`);
    else if (product.translations.length !== 1) errors.push(`${item.sku}: expected one Spanish translation`);
  }
  if (errors.length) throw new Error(errors.join('\n'));

  const snapshot = existing.map((product) => ({
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    spanish: product.translations[0],
  }));
  const stamp = new Date().toISOString().replaceAll(':', '-');
  const backupPath = resolve('/app/logs', `seo004-batch1-backup-${stamp}.json`);

  console.log(JSON.stringify({ mode: execute ? 'execute' : 'dry-run', products: snapshot.map(({ sku, slug }) => ({ sku, slug })) }, null, 2));
  if (!execute) process.exit(0);

  await mkdir(dirname(backupPath), { recursive: true });
  await writeFile(backupPath, JSON.stringify(snapshot, null, 2), 'utf8');

  await prisma.$transaction(
    patch.products.flatMap((item) => {
      const product = bySku.get(item.sku);
      return [
        prisma.product.update({
          where: { id: product.id },
          data: {
            name: item.en.name,
            shortDescription: item.en.shortDescription,
            seoTitle: item.en.seoTitle,
            seoDescription: item.en.seoDescription,
          },
        }),
        prisma.productTranslation.update({
          where: { productId_locale: { productId: product.id, locale: 'es' } },
          data: {
            name: item.es.name,
            shortDescription: item.es.shortDescription,
            seoTitle: item.es.seoTitle,
            seoDescription: item.es.seoDescription,
          },
        }),
      ];
    }),
  );

  console.log(JSON.stringify({ updated: patch.products.length, backupPath }, null, 2));
} finally {
  await prisma.$disconnect();
}
