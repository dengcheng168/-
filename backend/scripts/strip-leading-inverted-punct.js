// 一次性/可重复运行的维护脚本：西语内容按用户要求不使用倒问号/倒感叹号（¿/¡），
// 扫描所有 locale='es' 的翻译记录，去掉字段开头的 ¿/¡（只掐头，不动句中出现的位置）。
// 用法：node scripts/strip-leading-inverted-punct.js（容器内：docker compose exec backend node scripts/strip-leading-inverted-punct.js）
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function strip(value) {
  return typeof value === 'string' ? value.replace(/^[¿¡]+/, '') : value;
}

async function fixTable(name, findMany, fields, update) {
  const rows = await findMany();
  let changed = 0;
  for (const row of rows) {
    const data = {};
    for (const field of fields) {
      const stripped = strip(row[field]);
      if (stripped !== row[field]) data[field] = stripped;
    }
    if (Object.keys(data).length > 0) {
      await update(row.id, data);
      changed += 1;
      console.log(`${name}#${row.id}:`, data);
    }
  }
  console.log(`${name}: changed ${changed} of ${rows.length} rows`);
}

await fixTable(
  'faq_translations',
  () => prisma.faqTranslation.findMany({ where: { locale: 'es' } }),
  ['question', 'answer'],
  (id, data) => prisma.faqTranslation.update({ where: { id }, data }),
);

await fixTable(
  'product_translations',
  () => prisma.productTranslation.findMany({ where: { locale: 'es' } }),
  ['name', 'shortDescription', 'description', 'packagingInfo', 'moq', 'seoTitle', 'seoDescription', 'seoKeywords'],
  (id, data) => prisma.productTranslation.update({ where: { id }, data }),
);

await fixTable(
  'product_category_translations',
  () => prisma.productCategoryTranslation.findMany({ where: { locale: 'es' } }),
  ['name', 'description', 'seoTitle', 'seoDescription'],
  (id, data) => prisma.productCategoryTranslation.update({ where: { id }, data }),
);

await fixTable(
  'blog_post_translations',
  () => prisma.blogPostTranslation.findMany({ where: { locale: 'es' } }),
  ['title', 'excerpt', 'body', 'seoTitle', 'seoDescription'],
  (id, data) => prisma.blogPostTranslation.update({ where: { id }, data }),
);

await fixTable(
  'blog_category_translations',
  () => prisma.blogCategoryTranslation.findMany({ where: { locale: 'es' } }),
  ['name', 'description'],
  (id, data) => prisma.blogCategoryTranslation.update({ where: { id }, data }),
);

await fixTable(
  'certificate_translations',
  () => prisma.certificateTranslation.findMany({ where: { locale: 'es' } }),
  ['name', 'description'],
  (id, data) => prisma.certificateTranslation.update({ where: { id }, data }),
);

await fixTable(
  'page_translations',
  () => prisma.pageTranslation.findMany({ where: { locale: 'es' } }),
  ['title', 'bodyHtml', 'seoTitle', 'seoDescription'],
  (id, data) => prisma.pageTranslation.update({ where: { id }, data }),
);

await fixTable(
  'translations',
  () => prisma.translation.findMany({ where: { locale: 'es' } }),
  ['value'],
  (id, data) => prisma.translation.update({ where: { id }, data }),
);

await prisma.$disconnect();
