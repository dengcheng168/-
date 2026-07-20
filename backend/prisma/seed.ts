import { PrismaClient } from '@prisma/client';
import { toJsonString } from '../src/lib/json.js';

const prisma = new PrismaClient();

async function main() {
  console.log('开始写入演示数据...');

  // ---- 产品分类 ----
  const categories = await Promise.all(
    [
      {
        name: 'Reverse Osmosis Systems',
        slug: 'reverse-osmosis-systems',
        description: 'Point-of-use and point-of-entry RO systems for residential and light commercial use.',
        sortOrder: 1,
      },
      {
        name: 'Commercial & Industrial Filtration',
        slug: 'commercial-industrial-filtration',
        description: 'High-capacity filtration systems for factories, hotels, and commercial buildings.',
        sortOrder: 2,
      },
      {
        name: 'Whole House Water Filters',
        slug: 'whole-house-water-filters',
        description: 'Pre-filtration and softening systems for entire households.',
        sortOrder: 3,
      },
    ].map((c) => prisma.productCategory.upsert({ where: { slug: c.slug }, update: {}, create: c })),
  );

  // ---- 演示产品（6个）----
  const productDefs = [
    {
      name: 'RO-500 Under Sink Reverse Osmosis System',
      slug: 'ro-500-under-sink-reverse-osmosis-system',
      sku: 'RO-500',
      categoryId: categories[0].id,
      shortDescription: '5-stage under-sink RO system with 50 GPD membrane, suitable for OEM branding.',
      description:
        '<p>The RO-500 is a compact 5-stage reverse osmosis system designed for residential kitchens. Supports private-label packaging and custom filter housing colors for OEM/ODM partners.</p>',
      mainImage: '/images/placeholders/product-placeholder.svg',
      galleryImages: toJsonString([{ url: '/images/placeholders/product-placeholder.svg', alt: 'RO-500 product photo' }]),
      specs: toJsonString([
        { label: 'Daily Output', value: '50 GPD' },
        { label: 'Filter Stages', value: '5' },
        { label: 'Membrane Type', value: 'TFC' },
      ]),
      features: toJsonString(['5-stage filtration', 'Compact under-sink design', 'OEM/ODM ready']),
      applications: toJsonString([{ title: 'Home Kitchen', description: 'Drinking water purification for households.' }]),
      packagingInfo: 'Standard export carton, 1 unit per box, custom packaging available for OEM orders.',
      moq: '100 units',
      featured: true,
      sortOrder: 1,
      status: 'PUBLISHED',
    },
    {
      name: 'RO-800 Countertop Reverse Osmosis System',
      slug: 'ro-800-countertop-reverse-osmosis-system',
      sku: 'RO-800',
      categoryId: categories[0].id,
      shortDescription: 'Tankless countertop RO system with fast flow rate.',
      description: '<p>Tankless design saves counter space while delivering fast filtered water flow. Ideal for rental units and small apartments.</p>',
      mainImage: '/images/placeholders/product-placeholder.svg',
      galleryImages: toJsonString([{ url: '/images/placeholders/product-placeholder.svg', alt: 'RO-800 product photo' }]),
      specs: toJsonString([
        { label: 'Daily Output', value: '80 GPD' },
        { label: 'Filter Stages', value: '4' },
      ]),
      features: toJsonString(['Tankless design', 'Fast flow rate', 'Easy installation']),
      applications: toJsonString([{ title: 'Apartments', description: 'No-drill countertop installation.' }]),
      packagingInfo: 'Export carton, 1 unit per box.',
      moq: '100 units',
      featured: true,
      sortOrder: 2,
      status: 'PUBLISHED',
    },
    {
      name: 'CF-2000 Commercial Filtration Skid',
      slug: 'cf-2000-commercial-filtration-skid',
      sku: 'CF-2000',
      categoryId: categories[1].id,
      shortDescription: 'Skid-mounted commercial filtration system for hotels and factories.',
      description: '<p>Modular skid-mounted system with multi-stage pretreatment, suitable for hotels, factories, and commercial kitchens.</p>',
      mainImage: '/images/placeholders/product-placeholder.svg',
      galleryImages: toJsonString([{ url: '/images/placeholders/product-placeholder.svg', alt: 'CF-2000 product photo' }]),
      specs: toJsonString([
        { label: 'Flow Rate', value: '2000 L/h' },
        { label: 'Housing Material', value: 'Stainless Steel' },
      ]),
      features: toJsonString(['Skid-mounted design', 'Multi-stage pretreatment', 'Low maintenance']),
      applications: toJsonString([{ title: 'Hotels', description: 'Central water treatment for guest floors.' }]),
      packagingInfo: 'Wooden crate, export standard.',
      moq: '5 units',
      featured: true,
      sortOrder: 1,
      status: 'PUBLISHED',
    },
    {
      name: 'CF-5000 Industrial RO Plant',
      slug: 'cf-5000-industrial-ro-plant',
      sku: 'CF-5000',
      categoryId: categories[1].id,
      shortDescription: 'Large-scale industrial RO plant for manufacturing facilities.',
      description: '<p>High-capacity RO plant designed for continuous industrial operation, with PLC-based monitoring option.</p>',
      mainImage: '/images/placeholders/product-placeholder.svg',
      galleryImages: toJsonString([{ url: '/images/placeholders/product-placeholder.svg', alt: 'CF-5000 product photo' }]),
      specs: toJsonString([
        { label: 'Flow Rate', value: '5000 L/h' },
        { label: 'Control', value: 'PLC (optional)' },
      ]),
      features: toJsonString(['Continuous operation', 'PLC monitoring option', 'Industrial-grade components']),
      applications: toJsonString([{ title: 'Factories', description: 'Process water treatment for manufacturing lines.' }]),
      packagingInfo: 'Wooden crate, export standard.',
      moq: '2 units',
      featured: false,
      sortOrder: 2,
      status: 'PUBLISHED',
    },
    {
      name: 'WH-100 Whole House Sediment Filter',
      slug: 'wh-100-whole-house-sediment-filter',
      sku: 'WH-100',
      categoryId: categories[2].id,
      shortDescription: 'Whole house pre-filtration system for sediment and rust removal.',
      description: '<p>Protects household plumbing and appliances by removing sediment, rust, and particulates at the point of entry.</p>',
      mainImage: '/images/placeholders/product-placeholder.svg',
      galleryImages: toJsonString([{ url: '/images/placeholders/product-placeholder.svg', alt: 'WH-100 product photo' }]),
      specs: toJsonString([
        { label: 'Micron Rating', value: '5 micron' },
        { label: 'Connection', value: '1 inch NPT' },
      ]),
      features: toJsonString(['Whole house protection', 'Easy cartridge replacement']),
      applications: toJsonString([{ title: 'Residential', description: 'Point-of-entry filtration.' }]),
      packagingInfo: 'Export carton.',
      moq: '200 units',
      featured: false,
      sortOrder: 1,
      status: 'PUBLISHED',
    },
    {
      name: 'WH-200 Whole House Water Softener',
      slug: 'wh-200-whole-house-water-softener',
      sku: 'WH-200',
      categoryId: categories[2].id,
      shortDescription: 'Ion-exchange water softener for hard water treatment.',
      description: '<p>Reduces water hardness to protect appliances and improve soap/detergent efficiency across the household.</p>',
      mainImage: '/images/placeholders/product-placeholder.svg',
      galleryImages: toJsonString([{ url: '/images/placeholders/product-placeholder.svg', alt: 'WH-200 product photo' }]),
      specs: toJsonString([
        { label: 'Resin Capacity', value: '1.0 cu ft' },
        { label: 'Regeneration', value: 'Automatic timer' },
      ]),
      features: toJsonString(['Automatic regeneration', 'Reduces scale buildup']),
      applications: toJsonString([{ title: 'Residential', description: 'Whole-house hard water treatment.' }]),
      packagingInfo: 'Export carton.',
      moq: '200 units',
      featured: false,
      sortOrder: 2,
      status: 'PUBLISHED',
    },
  ];

  for (const p of productDefs) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }

  // ---- 博客分类 + 博客文章（3篇）----
  const blogCategory = await prisma.blogCategory.upsert({
    where: { slug: 'company-news' },
    update: {},
    create: { name: 'Company News', slug: 'company-news', sortOrder: 1 },
  });

  const blogPosts = [
    {
      title: 'How to Choose the Right OEM Water Purifier Partner',
      slug: 'how-to-choose-the-right-oem-water-purifier-partner',
      excerpt: 'Key factors overseas distributors should evaluate before selecting a water purifier OEM/ODM manufacturer.',
      body: '<p>Placeholder article body. Replace with real content covering factory audits, certification checks, and sample evaluation.</p>',
      categoryId: blogCategory.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    {
      title: 'Understanding RO Membrane Technology',
      slug: 'understanding-ro-membrane-technology',
      excerpt: 'A brief overview of reverse osmosis membrane technology and how it removes contaminants.',
      body: '<p>Placeholder article body. Replace with real technical content about TFC membranes, rejection rates, and maintenance.</p>',
      categoryId: blogCategory.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    {
      title: 'Factory Update: New Production Line Launched',
      slug: 'factory-update-new-production-line-launched',
      excerpt: 'Placeholder company news post announcing a new production line.',
      body: '<p>Placeholder article body. Replace with real factory news content.</p>',
      categoryId: blogCategory.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({ where: { slug: post.slug }, update: {}, create: post });
  }

  // ---- FAQ（4条）----
  const faqs = [
    { question: 'Do you support OEM and ODM services?', answer: 'Yes, we support full OEM/ODM customization including logo, packaging, and appearance.', sortOrder: 1 },
    { question: 'What is your minimum order quantity (MOQ)?', answer: 'MOQ varies by product, please see individual product pages or contact us for details.', sortOrder: 2 },
    { question: 'Can you provide product certifications?', answer: 'We can provide relevant certifications for our products upon request; see our Certificates page for examples.', sortOrder: 3 },
    { question: 'What is your typical lead time?', answer: 'Lead time depends on order volume and customization requirements; please contact us for an accurate quote.', sortOrder: 4 },
  ];
  for (const f of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question: f.question } });
    if (!existing) await prisma.faq.create({ data: f });
  }

  // ---- 认证证书占位（3个，明确标注为示例）----
  const certificates = [
    { name: 'CE Certificate (Sample Placeholder)', certType: 'CE', imageUrl: '/images/placeholders/product-placeholder.svg', description: 'Placeholder only — replace with your real certificate before launch.', sortOrder: 1 },
    { name: 'RoHS Certificate (Sample Placeholder)', certType: 'RoHS', imageUrl: '/images/placeholders/product-placeholder.svg', description: 'Placeholder only — replace with your real certificate before launch.', sortOrder: 2 },
    { name: 'ISO 9001 Certificate (Sample Placeholder)', certType: 'ISO', imageUrl: '/images/placeholders/product-placeholder.svg', description: 'Placeholder only — replace with your real certificate before launch.', sortOrder: 3 },
  ];
  for (const c of certificates) {
    const existing = await prisma.certificate.findFirst({ where: { name: c.name } });
    if (!existing) await prisma.certificate.create({ data: c });
  }

  // ---- 导航菜单 ----
  const navItems = [
    { label: 'Home', url: '/', sortOrder: 1 },
    { label: 'Products', url: '/products', sortOrder: 2 },
    { label: 'OEM / ODM', url: '/oem-odm', sortOrder: 3 },
    { label: 'Factory', url: '/factory', sortOrder: 4 },
    { label: 'Certificates', url: '/certificates', sortOrder: 5 },
    { label: 'About Us', url: '/about', sortOrder: 6 },
    { label: 'Blog', url: '/blog', sortOrder: 7 },
    { label: 'Contact', url: '/contact', sortOrder: 8 },
  ];
  for (const n of navItems) {
    const existing = await prisma.navigationItem.findFirst({ where: { label: n.label, url: n.url } });
    if (!existing) await prisma.navigationItem.create({ data: n });
  }

  // ---- 页面文案（About / Factory / OEM-ODM / Privacy / Terms / Contact）----
  const pages = [
    {
      slug: 'about',
      title: 'About Us',
      bodyHtml: '<p>Placeholder About Us content. Replace with real company history, mission, and values.</p>',
    },
    {
      slug: 'factory',
      title: 'Factory Strength',
      bodyHtml: '<p>Placeholder factory strength introduction.</p>',
      sections: toJsonString({
        factoryArea: '20,000 sqm (placeholder)',
        employeeCount: '150+ (placeholder)',
        productionLines: '6 (placeholder)',
        annualCapacity: '500,000 units/year (placeholder)',
      }),
    },
    {
      slug: 'oem-odm',
      title: 'OEM / ODM Services',
      bodyHtml: '<p>Placeholder OEM/ODM service introduction. Describe customizable logo, appearance, packaging, and functions here.</p>',
      sections: toJsonString({
        processSteps: [
          'Requirement Discussion',
          'Solution Design',
          'Sample Confirmation',
          'Mass Production',
          'Quality Inspection',
          'Global Delivery',
        ],
      }),
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      bodyHtml: '<p>Placeholder privacy policy content. Replace with your real, legally reviewed privacy policy before launch.</p>',
    },
    {
      slug: 'terms-of-use',
      title: 'Terms of Use',
      bodyHtml: '<p>Placeholder terms of use content. Replace with your real, legally reviewed terms before launch.</p>',
    },
    {
      slug: 'contact',
      title: 'Contact Us',
      bodyHtml: '<p>Placeholder contact page introduction text.</p>',
    },
    // certificates/blog 原本没有对应的 Page 行（这两个页面的标题/简介一直是写死在 page.tsx
    // 里的），这里只补一条空壳记录，好让后台"页面文案"能管理它们的顶部背景图；
    // 标题/正文仍然维持写死，不在这里改动，避免影响这两个页面已经在用的既有文案
    { slug: 'certificates', title: 'Certificates' },
    { slug: 'blog', title: 'Blog' },
  ];
  for (const p of pages) {
    await prisma.page.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }

  // ---- 首页/全局设置（单例行）----
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: 'Placeholder Water Purifier Factory Co., Ltd.',
      companyEmail: 'sales@example.com',
      companyPhone: '+86 000 0000 0000',
      companyAddress: 'Placeholder Industrial Zone, Placeholder City, China',
      whatsappNumber: '+86 000 0000 0000',
      coreAdvantages: toJsonString([
        { title: 'OEM/ODM Expertise', description: 'Placeholder — years of OEM/ODM manufacturing experience.' },
        { title: 'Quality Control', description: 'Placeholder — multi-stage quality inspection process.' },
        { title: 'Global Shipping', description: 'Placeholder — reliable export logistics worldwide.' },
      ]),
      stats: toJsonString([
        { label: 'Years in Business', value: '10+' },
        { label: 'Countries Served', value: '30+' },
        { label: 'Units Produced', value: '1,000,000+' },
      ]),
      oemProcessSteps: toJsonString([
        'Requirement Discussion',
        'Solution Design',
        'Sample Confirmation',
        'Mass Production',
        'Quality Inspection',
        'Global Delivery',
      ]),
      factoryStats: toJsonString([
        { label: 'Factory Area', value: '20,000 sqm' },
        { label: 'Employees', value: '150+' },
        { label: 'Production Lines', value: '6' },
      ]),
      factoryPhotos: toJsonString([]),
      partnerRegions: toJsonString(['North America', 'Europe', 'Middle East', 'Southeast Asia']),
      // 预置常见社媒平台，链接留空、默认关闭，管理员在后台填好链接后勾选启用即可
      socialLinks: toJsonString([
        { platform: 'facebook', label: 'Facebook', url: '', enabled: false },
        { platform: 'x', label: 'X (Twitter)', url: '', enabled: false },
        { platform: 'linkedin', label: 'LinkedIn', url: '', enabled: false },
        { platform: 'instagram', label: 'Instagram', url: '', enabled: false },
        { platform: 'youtube', label: 'YouTube', url: '', enabled: false },
        { platform: 'tiktok', label: 'TikTok', url: '', enabled: false },
        { platform: 'whatsapp', label: 'WhatsApp', url: '', enabled: false },
      ]),
    },
  });

  console.log('演示数据写入完成。');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
