// 一次性脚本：给首页"核心优势"三张卡片补上西班牙语译文（此前该字段没有接入 i18n，/es 首页一直显示英文原文）。
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const entries = [
  { key: 'settings.coreAdvantages.0.title', value: 'Experiencia en OEM/ODM' },
  {
    key: 'settings.coreAdvantages.0.description',
    value: 'Marcador de posición — años de experiencia en fabricación OEM/ODM.',
  },
  { key: 'settings.coreAdvantages.1.title', value: 'Control de Calidad' },
  {
    key: 'settings.coreAdvantages.1.description',
    value: 'Marcador de posición — proceso de inspección de calidad multietapa.',
  },
  { key: 'settings.coreAdvantages.2.title', value: 'Envío Global' },
  {
    key: 'settings.coreAdvantages.2.description',
    value: 'Marcador de posición — logística de exportación confiable a nivel mundial.',
  },
];

for (const { key, value } of entries) {
  await prisma.translation.upsert({
    where: { locale_key: { locale: 'es', key } },
    create: { locale: 'es', key, value },
    update: { value },
  });
  console.log('upserted', key);
}

await prisma.$disconnect();
