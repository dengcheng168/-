/**
 * 一次性内容回填脚本：为当前已发布的英文内容写入真实的西班牙语翻译（Phase G）。
 * 与 seed.ts 分开维护，避免混在演示数据脚本里。
 *
 * 规则（对应实施文档"内容回填"一节）：
 * - 只新增翻译记录，从不修改英文主表字段；
 * - 跳过已经存在 es 翻译的记录（不覆盖管理员已手动编辑的内容），可重复安全运行；
 * - 支持 --dry-run，只打印将创建/跳过的条数，不写库；
 * - 写入的翻译状态为 PUBLISHED（当前内容已发布，需要真正在前台可见，不是占位草稿）；
 * - 不翻译 SKU/型号/图片/文件地址/证书编号/数值本身——只翻译文字字段。
 *
 * 运行：
 *   npx tsx prisma/seed-translations.ts
 *   npx tsx prisma/seed-translations.ts --dry-run
 */
import { PrismaClient } from '@prisma/client';
import { toJsonString } from '../src/lib/json.js';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');
const LOCALE = 'es';

const counters = { created: 0, skipped: 0, failed: 0 };

function report(entity: string, key: string | number, action: 'created' | 'skipped' | 'failed') {
  counters[action]++;
  console.log(`[${action}] ${entity} ${key}`);
}

// ---- 产品翻译（按 slug 索引，仅译文字字段；specs 的 value 数值本身不译，只译 label） ----
const productTranslations: Record<
  string,
  {
    name: string;
    shortDescription: string;
    description: string;
    specs: { label: string; value: string }[];
    features: string[];
    applications: { title: string; description: string }[];
    packagingInfo: string;
    moq: string;
  }
> = {
  'ro-500-under-sink-reverse-osmosis-system': {
    name: 'Sistema de Ósmosis Inversa RO-500 para Debajo del Fregadero',
    shortDescription:
      'Sistema de ósmosis inversa de 5 etapas con membrana de 50 GPD, apto para marca blanca (OEM).',
    description:
      '<p>El RO-500 es un sistema compacto de ósmosis inversa de 5 etapas diseñado para cocinas residenciales. Admite empaque de marca privada y colores personalizados de carcasa de filtro para socios OEM/ODM.</p>',
    specs: [
      { label: 'Producción Diaria', value: '50 GPD' },
      { label: 'Etapas de Filtración', value: '5' },
      { label: 'Tipo de Membrana', value: 'TFC' },
    ],
    features: ['Filtración de 5 etapas', 'Diseño compacto para debajo del fregadero', 'Listo para OEM/ODM'],
    applications: [{ title: 'Cocina Doméstica', description: 'Purificación de agua potable para hogares.' }],
    packagingInfo:
      'Caja de exportación estándar, 1 unidad por caja; empaque personalizado disponible para pedidos OEM.',
    moq: '100 unidades',
  },
  'ro-800-countertop-reverse-osmosis-system': {
    name: 'Sistema de Ósmosis Inversa RO-800 de Sobremesa',
    shortDescription: 'Sistema de ósmosis inversa de sobremesa sin tanque, con caudal rápido.',
    description:
      '<p>El diseño sin tanque ahorra espacio en la encimera y ofrece un flujo rápido de agua filtrada. Ideal para unidades de alquiler y apartamentos pequeños.</p>',
    specs: [
      { label: 'Producción Diaria', value: '80 GPD' },
      { label: 'Etapas de Filtración', value: '4' },
    ],
    features: ['Diseño sin tanque', 'Caudal rápido', 'Instalación sencilla'],
    applications: [{ title: 'Apartamentos', description: 'Instalación de sobremesa sin necesidad de perforaciones.' }],
    packagingInfo: 'Caja de exportación, 1 unidad por caja.',
    moq: '100 unidades',
  },
  'cf-2000-commercial-filtration-skid': {
    name: 'Sistema de Filtración Comercial en Skid CF-2000',
    shortDescription: 'Sistema de filtración comercial montado sobre skid para hoteles y fábricas.',
    description:
      '<p>Sistema modular montado sobre skid con pretratamiento de múltiples etapas, adecuado para hoteles, fábricas y cocinas comerciales.</p>',
    specs: [
      { label: 'Caudal', value: '2000 L/h' },
      { label: 'Material de la Carcasa', value: 'Acero Inoxidable' },
    ],
    features: ['Diseño montado sobre skid', 'Pretratamiento de múltiples etapas', 'Bajo mantenimiento'],
    applications: [{ title: 'Hoteles', description: 'Tratamiento de agua centralizado para pisos de huéspedes.' }],
    packagingInfo: 'Caja de madera, estándar de exportación.',
    moq: '5 unidades',
  },
  'cf-5000-industrial-ro-plant': {
    name: 'Planta Industrial de Ósmosis Inversa CF-5000',
    shortDescription: 'Planta industrial de ósmosis inversa de gran capacidad para instalaciones de manufactura.',
    description:
      '<p>Planta de ósmosis inversa de alta capacidad diseñada para operación industrial continua, con opción de monitoreo basado en PLC.</p>',
    specs: [
      { label: 'Caudal', value: '5000 L/h' },
      { label: 'Control', value: 'PLC (opcional)' },
    ],
    features: ['Operación continua', 'Opción de monitoreo por PLC', 'Componentes de grado industrial'],
    applications: [{ title: 'Fábricas', description: 'Tratamiento de agua de proceso para líneas de manufactura.' }],
    packagingInfo: 'Caja de madera, estándar de exportación.',
    moq: '2 unidades',
  },
  'wh-100-whole-house-sediment-filter': {
    name: 'Filtro de Sedimentos para Toda la Casa WH-100',
    shortDescription: 'Sistema de prefiltración para toda la casa que elimina sedimentos y óxido.',
    description:
      '<p>Protege la plomería y los electrodomésticos del hogar al eliminar sedimentos, óxido y partículas en el punto de entrada.</p>',
    specs: [
      { label: 'Grado de Filtración', value: '5 micrones' },
      { label: 'Conexión', value: '1 pulgada NPT' },
    ],
    features: ['Protección para toda la casa', 'Fácil reemplazo del cartucho'],
    applications: [{ title: 'Residencial', description: 'Filtración en el punto de entrada.' }],
    packagingInfo: 'Caja de exportación.',
    moq: '200 unidades',
  },
  'wh-200-whole-house-water-softener': {
    name: 'Suavizador de Agua para Toda la Casa WH-200',
    shortDescription: 'Suavizador de agua por intercambio iónico para tratamiento de agua dura.',
    description:
      '<p>Reduce la dureza del agua para proteger los electrodomésticos y mejorar la eficiencia del jabón y detergente en todo el hogar.</p>',
    specs: [
      { label: 'Capacidad de Resina', value: '1.0 pie³' },
      { label: 'Regeneración', value: 'Temporizador automático' },
    ],
    features: ['Regeneración automática', 'Reduce la acumulación de sarro'],
    applications: [{ title: 'Residencial', description: 'Tratamiento de agua dura para toda la casa.' }],
    packagingInfo: 'Caja de exportación.',
    moq: '200 unidades',
  },
};

const categoryTranslations: Record<string, { name: string; description: string }> = {
  'reverse-osmosis-systems': {
    name: 'Sistemas de Ósmosis Inversa',
    description:
      'Sistemas de ósmosis inversa de punto de uso y punto de entrada para uso residencial y comercial ligero.',
  },
  'commercial-industrial-filtration': {
    name: 'Filtración Comercial e Industrial',
    description: 'Sistemas de filtración de alta capacidad para fábricas, hoteles y edificios comerciales.',
  },
  'whole-house-water-filters': {
    name: 'Filtros de Agua para Toda la Casa',
    description: 'Sistemas de prefiltración y suavizado para todo el hogar.',
  },
};

const blogPostTranslations: Record<string, { title: string; excerpt: string; body: string }> = {
  'how-to-choose-the-right-oem-water-purifier-partner': {
    title: 'Cómo Elegir el Socio OEM de Purificadores de Agua Adecuado',
    excerpt:
      'Factores clave que los distribuidores en el extranjero deben evaluar antes de seleccionar un fabricante OEM/ODM de purificadores de agua.',
    body: '<p>Contenido de artículo de muestra. Sustituir por contenido real sobre auditorías de fábrica, verificación de certificaciones y evaluación de muestras.</p>',
  },
  'understanding-ro-membrane-technology': {
    title: 'Cómo Entender la Tecnología de Membranas de Ósmosis Inversa',
    excerpt: 'Una breve introducción a la tecnología de membranas de ósmosis inversa y cómo elimina los contaminantes.',
    body: '<p>Contenido de artículo de muestra. Sustituir por contenido técnico real sobre membranas TFC, tasas de rechazo y mantenimiento.</p>',
  },
  'factory-update-new-production-line-launched': {
    title: 'Novedades de Fábrica: Nueva Línea de Producción Inaugurada',
    excerpt: 'Publicación de noticias de la empresa de muestra que anuncia una nueva línea de producción.',
    body: '<p>Contenido de artículo de muestra. Sustituir por contenido real de noticias de fábrica.</p>',
  },
};

const blogCategoryTranslations: Record<string, { name: string }> = {
  'company-news': { name: 'Noticias de la Empresa' },
};

const certificateTranslations: Record<string, { name: string; description: string }> = {
  'CE Certificate (Sample Placeholder)': {
    name: 'Certificado CE (Muestra de Marcador de Posición)',
    description: 'Solo de muestra — sustituya por su certificado real antes del lanzamiento.',
  },
  'RoHS Certificate (Sample Placeholder)': {
    name: 'Certificado RoHS (Muestra de Marcador de Posición)',
    description: 'Solo de muestra — sustituya por su certificado real antes del lanzamiento.',
  },
  'ISO 9001 Certificate (Sample Placeholder)': {
    name: 'Certificado ISO 9001 (Muestra de Marcador de Posición)',
    description: 'Solo de muestra — sustituya por su certificado real antes del lanzamiento.',
  },
};

const pageTranslations: Record<
  string,
  { title: string; bodyHtml?: string; sections?: unknown }
> = {
  about: {
    title: 'Sobre Nuestra Fábrica',
    bodyHtml:
      '<p>Contenido de muestra para la página Sobre Nosotros. Sustituir por la historia real de la empresa, misión y valores.</p>',
  },
  factory: {
    title: 'Fortaleza de Fábrica',
    bodyHtml: '<p>Introducción de muestra sobre la fortaleza de la fábrica.</p>',
    sections: {
      factoryArea: '20,000 m² (marcador de posición)',
      employeeCount: '150+ (marcador de posición)',
      productionLines: '6 (marcador de posición)',
      annualCapacity: '500,000 unidades/año (marcador de posición)',
    },
  },
  'oem-odm': {
    title: 'Servicios OEM / ODM',
    bodyHtml:
      '<p>Introducción de muestra sobre servicios OEM/ODM. Describa aquí el logotipo personalizable, la apariencia, el empaque y las funciones.</p>',
    sections: {
      processSteps: [
        'Discusión de Requisitos',
        'Diseño de la Solución',
        'Confirmación de Muestra',
        'Producción en Masa',
        'Inspección de Calidad',
        'Entrega Global',
      ],
    },
  },
  'privacy-policy': {
    title: 'Política de Privacidad',
    bodyHtml:
      '<p>Contenido de muestra de política de privacidad. Sustituya por su política de privacidad real, revisada legalmente, antes del lanzamiento.</p>',
  },
  'terms-of-use': {
    title: 'Términos de Uso',
    bodyHtml:
      '<p>Contenido de muestra de términos de uso. Sustituya por sus términos reales, revisados legalmente, antes del lanzamiento.</p>',
  },
  contact: {
    title: 'Contáctenos',
    bodyHtml: '<p>Texto de muestra de introducción para la página de contacto.</p>',
  },
  certificates: { title: 'Certificados' },
  blog: { title: 'Blog' },
  products: { title: 'Productos' },
};

const faqTranslations: Record<string, { question: string; answer: string }> = {
  'Do you support OEM and ODM services?': {
    question: '¿Ofrecen servicios OEM y ODM?',
    answer: 'Sí, ofrecemos personalización OEM/ODM completa, incluyendo logotipo, empaque y apariencia.',
  },
  'What is your minimum order quantity (MOQ)?': {
    question: '¿Cuál es su cantidad mínima de pedido (MOQ)?',
    answer: 'El MOQ varía según el producto; consulte las páginas de cada producto o contáctenos para más detalles.',
  },
  'Can you provide product certifications?': {
    question: '¿Pueden proporcionar certificaciones de producto?',
    answer:
      'Podemos proporcionar las certificaciones pertinentes de nuestros productos a solicitud; consulte nuestra página de Certificados para ver ejemplos.',
  },
  'What is your typical lead time?': {
    question: '¿Cuál es su plazo de entrega habitual?',
    answer:
      'El plazo de entrega depende del volumen del pedido y los requisitos de personalización; contáctenos para una cotización precisa.',
  },
};

async function seedProducts() {
  const products = await prisma.product.findMany({ where: { status: 'PUBLISHED', deletedAt: null } });
  for (const product of products) {
    const t = productTranslations[product.slug];
    if (!t) continue;
    const existing = await prisma.productTranslation.findUnique({
      where: { productId_locale: { productId: product.id, locale: LOCALE } },
    });
    if (existing) {
      report('product', product.slug, 'skipped');
      continue;
    }
    if (DRY_RUN) {
      report('product', product.slug, 'created');
      continue;
    }
    try {
      await prisma.productTranslation.create({
        data: {
          productId: product.id,
          locale: LOCALE,
          name: t.name,
          shortDescription: t.shortDescription,
          description: t.description,
          specs: toJsonString(t.specs),
          features: toJsonString(t.features),
          applications: toJsonString(t.applications),
          packagingInfo: t.packagingInfo,
          moq: t.moq,
          translationStatus: 'PUBLISHED',
        },
      });
      report('product', product.slug, 'created');
    } catch (err) {
      console.error(err);
      report('product', product.slug, 'failed');
    }
  }
}

async function seedProductCategories() {
  const categories = await prisma.productCategory.findMany({ where: { published: true, deletedAt: null } });
  for (const category of categories) {
    const t = categoryTranslations[category.slug];
    if (!t) continue;
    const existing = await prisma.productCategoryTranslation.findUnique({
      where: { categoryId_locale: { categoryId: category.id, locale: LOCALE } },
    });
    if (existing) {
      report('product-category', category.slug, 'skipped');
      continue;
    }
    if (DRY_RUN) {
      report('product-category', category.slug, 'created');
      continue;
    }
    try {
      await prisma.productCategoryTranslation.create({
        data: {
          categoryId: category.id,
          locale: LOCALE,
          name: t.name,
          description: t.description,
          translationStatus: 'PUBLISHED',
        },
      });
      report('product-category', category.slug, 'created');
    } catch (err) {
      console.error(err);
      report('product-category', category.slug, 'failed');
    }
  }
}

async function seedBlogPosts() {
  const posts = await prisma.blogPost.findMany({ where: { status: 'PUBLISHED', deletedAt: null } });
  for (const post of posts) {
    const t = blogPostTranslations[post.slug];
    if (!t) continue;
    const existing = await prisma.blogPostTranslation.findUnique({
      where: { postId_locale: { postId: post.id, locale: LOCALE } },
    });
    if (existing) {
      report('blog-post', post.slug, 'skipped');
      continue;
    }
    if (DRY_RUN) {
      report('blog-post', post.slug, 'created');
      continue;
    }
    try {
      await prisma.blogPostTranslation.create({
        data: {
          postId: post.id,
          locale: LOCALE,
          title: t.title,
          excerpt: t.excerpt,
          body: t.body,
          translationStatus: 'PUBLISHED',
        },
      });
      report('blog-post', post.slug, 'created');
    } catch (err) {
      console.error(err);
      report('blog-post', post.slug, 'failed');
    }
  }
}

async function seedBlogCategories() {
  const categories = await prisma.blogCategory.findMany({ where: { published: true, deletedAt: null } });
  for (const category of categories) {
    const t = blogCategoryTranslations[category.slug];
    if (!t) continue;
    const existing = await prisma.blogCategoryTranslation.findUnique({
      where: { categoryId_locale: { categoryId: category.id, locale: LOCALE } },
    });
    if (existing) {
      report('blog-category', category.slug, 'skipped');
      continue;
    }
    if (DRY_RUN) {
      report('blog-category', category.slug, 'created');
      continue;
    }
    try {
      await prisma.blogCategoryTranslation.create({
        data: { categoryId: category.id, locale: LOCALE, name: t.name, translationStatus: 'PUBLISHED' },
      });
      report('blog-category', category.slug, 'created');
    } catch (err) {
      console.error(err);
      report('blog-category', category.slug, 'failed');
    }
  }
}

async function seedCertificates() {
  const certificates = await prisma.certificate.findMany({ where: { published: true, deletedAt: null } });
  for (const cert of certificates) {
    const t = certificateTranslations[cert.name];
    if (!t) continue;
    const existing = await prisma.certificateTranslation.findUnique({
      where: { certificateId_locale: { certificateId: cert.id, locale: LOCALE } },
    });
    if (existing) {
      report('certificate', cert.name, 'skipped');
      continue;
    }
    if (DRY_RUN) {
      report('certificate', cert.name, 'created');
      continue;
    }
    try {
      await prisma.certificateTranslation.create({
        data: {
          certificateId: cert.id,
          locale: LOCALE,
          name: t.name,
          description: t.description,
          translationStatus: 'PUBLISHED',
        },
      });
      report('certificate', cert.name, 'created');
    } catch (err) {
      console.error(err);
      report('certificate', cert.name, 'failed');
    }
  }
}

async function seedPages() {
  const pages = await prisma.page.findMany();
  for (const page of pages) {
    const t = pageTranslations[page.slug];
    if (!t) continue;
    const existing = await prisma.pageTranslation.findUnique({
      where: { pageId_locale: { pageId: page.id, locale: LOCALE } },
    });
    if (existing) {
      report('page', page.slug, 'skipped');
      continue;
    }
    if (DRY_RUN) {
      report('page', page.slug, 'created');
      continue;
    }
    try {
      await prisma.pageTranslation.create({
        data: {
          pageId: page.id,
          locale: LOCALE,
          title: t.title,
          bodyHtml: t.bodyHtml,
          sections: t.sections !== undefined ? toJsonString(t.sections) : undefined,
          translationStatus: 'PUBLISHED',
        },
      });
      report('page', page.slug, 'created');
    } catch (err) {
      console.error(err);
      report('page', page.slug, 'failed');
    }
  }
}

async function seedFaqs() {
  const faqs = await prisma.faq.findMany({ where: { published: true } });
  for (const faq of faqs) {
    const t = faqTranslations[faq.question];
    if (!t) continue;
    const existing = await prisma.faqTranslation.findUnique({
      where: { faqId_locale: { faqId: faq.id, locale: LOCALE } },
    });
    if (existing) {
      report('faq', faq.id, 'skipped');
      continue;
    }
    if (DRY_RUN) {
      report('faq', faq.id, 'created');
      continue;
    }
    try {
      await prisma.faqTranslation.create({
        data: {
          faqId: faq.id,
          locale: LOCALE,
          question: t.question,
          answer: t.answer,
          translationStatus: 'PUBLISHED',
        },
      });
      report('faq', faq.id, 'created');
    } catch (err) {
      console.error(err);
      report('faq', faq.id, 'failed');
    }
  }
}

async function main() {
  console.log(`开始回填西班牙语翻译${DRY_RUN ? '（--dry-run，不写库）' : ''}...`);
  await seedProducts();
  await seedProductCategories();
  await seedBlogPosts();
  await seedBlogCategories();
  await seedCertificates();
  await seedPages();
  await seedFaqs();
  console.log(`完成：created=${counters.created} skipped=${counters.skipped} failed=${counters.failed}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
