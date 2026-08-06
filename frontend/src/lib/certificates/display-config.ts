import type { Locale } from '@/lib/i18n/locales';

export type CertificateGroup = 'approvals' | 'compliance' | 'historical';

interface CertificateDisplayMeta {
  group: CertificateGroup;
  /** 适用产品类型，来自证书正文/证书原图，不是猜测 */
  productType: { en: string; es: string };
  /** 适用型号；null 表示证书正文没有列出具体型号，展示时改用"Refer to certificate scope" */
  models: string[] | null;
  /** 只有证书正文明确写了当前有效期/已过期时才填，其余一律 null（不展示 Valid/Expired） */
  status: { en: string; es: string } | null;
  /** 过期日期单独一行展示（目前只有 Eurofins 用到） */
  expiredOn: { en: string; es: string } | null;
}

/**
 * 按证书数据库主键 id 做的展示分类映射——不是猜测，每一条都能在证书 description 原文
 * 里找到依据（型号列表、Valid from/to、Issued on ... expired on ...）。
 *
 * 生产库里 WRAS Product Approval 曾经被重复发布了 3 次（id 5/6/9，同一个 Approval Number
 * 240902711），id 5、6 是早期草稿（没有西语翻译、certNumber/description 不全），id 9 是
 * 最后一次编辑、内容和西语翻译都完整的版本——这里只登记 id 9，其余两条不在此表内的证书
 * 一律不会出现在 /certificates、/es/certificates 和首页证书预览里，从源头避免重复卡片，
 * 不需要改动数据库。同理，后台里状态为草稿的占位证书（Sample Placeholder）也不在这张表里。
 */
export const CERTIFICATE_DISPLAY_CONFIG: Record<number, CertificateDisplayMeta> = {
  9: {
    group: 'approvals',
    productType: { en: 'Water Conditioners', es: 'Acondicionadores de agua' },
    models: ['WDM001', 'WD001'],
    status: { en: 'Valid through September 2029', es: 'Válido hasta septiembre de 2029' },
    expiredOn: null,
  },
  10: {
    group: 'approvals',
    productType: { en: 'UV Water Purifiers', es: 'Purificadores de agua UV' },
    models: [
      'SAG-048', 'SDE-025', 'SDE-025FS', 'SDE-055', 'SDE-055FS', 'SDS-110',
      'SDS-220', 'SSE-012', 'SSE-012FS', 'SSE-016', 'SSE-016FS', 'AGLED-40002',
    ],
    status: null,
    expiredOn: null,
  },
  8: {
    group: 'compliance',
    productType: { en: 'UV Sterilizers', es: 'Esterilizadores UV' },
    // SGS 证书正文只写了适用 UV Sterilizers，没有列出具体型号，不能替它补全
    models: null,
    status: null,
    expiredOn: null,
  },
  11: {
    group: 'compliance',
    productType: { en: 'UV Sterilizers', es: 'Esterilizadores UV' },
    models: ['SSE-006', 'SDE-025', 'SDS-110', 'SAG-4'],
    status: null,
    expiredOn: null,
  },
  12: {
    group: 'compliance',
    productType: { en: 'Electronic Fluorescent-Lamp Ballast', es: 'Balastro electrónico fluorescente' },
    models: ['ZLP4-425-55'],
    status: null,
    expiredOn: null,
  },
  13: {
    group: 'historical',
    productType: { en: 'Household UV Reactors', es: 'Reactores UV domésticos' },
    models: ['SSE-011', 'SDE-016', 'SDE-025', 'SDE-040'],
    status: { en: 'Expired', es: 'Caducado' },
    expiredOn: { en: 'October 10, 2021', es: '10 de octubre de 2021' },
  },
};

export function getCertificateDisplayMeta(id: number): CertificateDisplayMeta | null {
  return CERTIFICATE_DISPLAY_CONFIG[id] ?? null;
}

export function localizeCertMeta(meta: CertificateDisplayMeta, locale: Locale) {
  return {
    group: meta.group,
    productType: locale === 'es' ? meta.productType.es : meta.productType.en,
    models: meta.models,
    status: meta.status ? (locale === 'es' ? meta.status.es : meta.status.en) : null,
    expiredOn: meta.expiredOn ? (locale === 'es' ? meta.expiredOn.es : meta.expiredOn.en) : null,
  };
}
