/**
 * 一次性脚本：把原来写死在 About 页面 sections 字段里的工厂展示图文字内容
 * （标题+描述，图片是失效占位路径，没有真实图片）迁移成 FactoryGalleryItem 结构化记录。
 * 跑完之后管理员在后台"工厂展示图"里给每一条上传真实图片即可。
 * 用法：npx tsx prisma/seed-factory-gallery.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const items = [
  { galleryGroup: 'quality', title: 'Temperature Testing Chamber', description: 'Environmental reliability testing under controlled temperature conditions.' },
  { galleryGroup: 'quality', title: 'Salt Spray Test', description: 'Corrosion-resistance verification for metal parts and product surfaces.' },
  { galleryGroup: 'quality', title: 'Pressure Testing', description: 'Performance and safety inspection under controlled testing conditions.' },
  { galleryGroup: 'quality', title: 'Automated Testing Line', description: 'Automated inspection and grading for stable product quality.' },
  { galleryGroup: 'manufacturing', title: 'Automated Production', description: 'Consistent manufacturing supported by standardized automated equipment.' },
  { galleryGroup: 'manufacturing', title: 'Assembly Workshop', description: 'Organized assembly areas designed for efficient production workflows.' },
  { galleryGroup: 'manufacturing', title: 'Production Assembly Line', description: 'Efficient and repeatable assembly from components to finished products.' },
  { galleryGroup: 'manufacturing', title: 'Packaging Area', description: 'Final inspection, protective packaging and shipment preparation.' },
  { galleryGroup: 'visits', title: 'Product Discussion', description: 'Direct communication about product specifications and market requirements.' },
  { galleryGroup: 'visits', title: 'Product Demonstration', description: 'Hands-on presentation of product functions, installation and operation.' },
  { galleryGroup: 'visits', title: 'International Customer Visit', description: 'On-site review of factory facilities, capacity and quality processes.' },
  { galleryGroup: 'visits', title: 'Project Consultation', description: 'OEM, ODM and commercial project planning with our technical team.' },
  { galleryGroup: 'visits', title: 'Business Partner Meeting', description: 'Cooperation discussions for distribution and long-term market development.' },
  { galleryGroup: 'visits', title: 'Customer Group Visit', description: 'Transparent review of production workflow and quality-control standards.' },
  { galleryGroup: 'visits', title: 'Cooperation Photo', description: 'Building reliable and lasting partnerships with global customers.' },
  { galleryGroup: 'manufacturing', title: 'Production Line Inspection', description: 'On-site verification of manufacturing processes and production capability.' },
];

async function main() {
  const existing = await prisma.factoryGalleryItem.count();
  if (existing > 0) {
    console.log(`factory_gallery_items 已有 ${existing} 条记录，跳过导入，避免重复。`);
    return;
  }
  for (let i = 0; i < items.length; i++) {
    await prisma.factoryGalleryItem.create({
      data: { ...items[i], sortOrder: i + 1, published: true },
    });
  }
  console.log(`已导入 ${items.length} 条工厂展示图记录（暂无图片，需要在后台上传）。`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
