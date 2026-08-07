import type { Locale } from '@/lib/i18n/locales';
import type { Certificate } from '@/types/content';

export type CertificateGroup = 'approvals' | 'compliance' | 'historical' | 'unclassified';

export interface CertificateDisplayMeta {
  group: CertificateGroup;
  /**
   * 仅供 /certificates 页面决定"展示在哪个标题下"使用，不影响其它任何判断——首页
   * CertificatesShowcase 的入选过滤、卡片的 muted 灰化样式、status 徽章颜色全部继续
   * 只认 group，不认 displaySection。目的：网站所有者可以把一份已过期证书摆到
   * Product Approvals 标题下面展示（不想让它单独占一个"过期"分组），但不能因此让它
   * 悄悄混进首页预览轮播（首页卡片不展示 Expired 状态，混进去等于把过期证书伪装成
   * 当前有效认证），也不能让它在 Approvals 分组下面还用"有效"的配色徽章。
   * 不填时按 group 本身的分组展示（绝大多数证书都是这种情况）。
   */
  displaySection?: CertificateGroup;
  /** 适用产品类型，来自证书正文/证书原图，不是猜测；unclassified 时为 null */
  productType: { en: string; es: string } | null;
  /** 适用型号；null 表示证书正文没有列出具体型号，展示时改用"Refer to certificate scope" */
  models: string[] | null;
  /** 只有证书正文明确写了当前有效期/已过期时才填，其余一律 null（不展示 Valid/Expired） */
  status: { en: string; es: string } | null;
  /** 过期日期单独一行展示（目前只有 Eurofins 用到） */
  expiredOn: { en: string; es: string } | null;
}

interface CertificateRule extends CertificateDisplayMeta {
  /** 优先匹配键：证书正文自带的证书/批准编号，大小写和首尾空白不敏感 */
  certNumber?: string;
  /**
   * certNumber 为空时的兜底匹配键（目前只有 Eurofins 用到——它的证书原文没有编号字段）。
   * 只用 issuingAuthority，不掺 name：Certificate.name 在 /es 页面会被 CertificateTranslation
   * 覆盖成西语译文，如果兜底键里也要求 name 匹配英文原文，西语页面会永远匹配不上、
   * 错误地降级到 Unclassified（这里踩过一次坑，issuingAuthority 字段本身没有对应的翻译表列，
   * 任何 locale 下都是同一个值，作为唯一匹配键更稳）。生产库里这个签发机构目前只对应
   * 一份证书，唯一性足够。
   */
  fallback?: { issuingAuthority: string };
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * 按证书"业务字段"（证书编号，或签发机构+标准化名称组合）做的展示分类映射——不依赖数据库
 * 主键 id。每一条规则的分类/适用范围/状态都能在证书 description 原文里找到依据（型号列表、
 * Valid from/to、Issued on ... expired on ...），不是猜测。
 *
 * 为什么不用 id：生产库里 WRAS Product Approval 曾经被重复发布过 3 次（id 5/6/9，同一个
 * Approval Number 240902711），网站所有者已确认只保留 id 9 公开发布、id 5/6 通过后台
 * unpublish 下线（见 scripts/maintenance 目录）。公开查询接口本身已经会过滤
 * published=true（backend/src/modules/certificates/certificates.service.ts），所以
 * id 5/6 下线后不会再进入这份数据；这里改成按 certNumber 识别，即使以后测试库/恢复库里
 * 同一张证书的主键 id 变了，只要证书编号没变就还能正确识别、正确分类。
 */
const RULES: CertificateRule[] = [
  {
    // WRAS Product Approval — Approval Number 240902711
    certNumber: '240902711',
    group: 'approvals',
    productType: { en: 'Water Conditioners', es: 'Acondicionadores de agua' },
    models: ['WDM001', 'WD001'],
    status: { en: 'Valid through September 2029', es: 'Válido hasta septiembre de 2029' },
    expiredOn: null,
  },
  {
    // CSA Certificate of Compliance
    certNumber: '80178889',
    group: 'approvals',
    productType: { en: 'UV Water Purifiers', es: 'Purificadores de agua UV' },
    models: [
      'SAG-048', 'SDE-025', 'SDE-025FS', 'SDE-055', 'SDE-055FS', 'SDS-110',
      'SDS-220', 'SSE-012', 'SSE-012FS', 'SSE-016', 'SSE-016FS', 'AGLED-40002',
    ],
    status: null,
    expiredOn: null,
  },
  {
    // SGS CE EMC Verification of Compliance
    certNumber: 'SHEM240200078201HSC',
    group: 'compliance',
    productType: { en: 'UV Sterilizers', es: 'Esterilizadores UV' },
    // SGS 证书正文只写了适用 UV Sterilizers，没有列出具体型号，不能替它补全
    models: null,
    status: null,
    expiredOn: null,
  },
  {
    // TÜV Rheinland RoHS Test Report
    certNumber: '0154126398a 001',
    group: 'compliance',
    productType: { en: 'UV Sterilizers', es: 'Esterilizadores UV' },
    models: ['SSE-006', 'SDE-025', 'SDS-110', 'SAG-4'],
    status: null,
    expiredOn: null,
  },
  {
    // UL Certificate of Compliance
    certNumber: '20190516-E498777',
    group: 'compliance',
    productType: { en: 'Electronic Fluorescent-Lamp Ballast', es: 'Balastro electrónico fluorescente' },
    models: ['ZLP4-425-55'],
    status: null,
    expiredOn: null,
  },
  {
    // Eurofins ACS Sanitary Conformity Certificate — 证书原文没有编号字段，
    // 用签发机构 + 标准化证书名称组合识别
    fallback: { issuingAuthority: 'Eurofins Expertises Environnementales' },
    // 网站所有者要求把它摆到 Product Approvals 标题下面展示（仅调整 /certificates
    // 页面的展示位置），但 group 本身必须保持 'historical'：首页 CertificatesShowcase
    // 只按 group 过滤，且不展示 Expired 状态，group 一旦改成 'approvals' 这份已过期
    // 证书就会未经任何过期提示地混进首页预览轮播。见 displaySection 字段注释。
    group: 'historical',
    displaySection: 'approvals',
    productType: { en: 'Household UV Reactors', es: 'Reactores UV domésticos' },
    models: ['SSE-011', 'SDE-016', 'SDE-025', 'SDE-040'],
    status: { en: 'Expired', es: 'Caducado' },
    expiredOn: { en: 'October 10, 2021', es: '10 de octubre de 2021' },
  },
];

const UNCLASSIFIED_META: CertificateDisplayMeta = {
  group: 'unclassified',
  productType: null,
  models: null,
  status: null,
  expiredOn: null,
};

type CertificateLike = Pick<Certificate, 'id' | 'name' | 'certNumber' | 'issuingAuthority'>;

function findRule(cert: CertificateLike): CertificateRule | null {
  const certNumber = cert.certNumber ? normalize(cert.certNumber) : null;
  if (certNumber) {
    const byCertNumber = RULES.find((r) => r.certNumber && normalize(r.certNumber) === certNumber);
    if (byCertNumber) return byCertNumber;
  }
  if (cert.issuingAuthority) {
    const issuer = normalize(cert.issuingAuthority);
    const byFallback = RULES.find((r) => r.fallback && normalize(r.fallback.issuingAuthority) === issuer);
    if (byFallback) return byFallback;
  }
  return null;
}

/**
 * 安全降级：任何已发布但匹配不到规则的证书（比如后台新增了一份还没登记进这份 config 的
 * 证书）不会从页面上"静默消失"——会被归入 Unclassified Documents，Applicable Models
 * 显示 Refer to certificate scope，不展示 Valid/Expired；开发环境额外打印警告方便发现。
 */
export function getCertificateDisplayMeta(cert: CertificateLike): CertificateDisplayMeta {
  const rule = findRule(cert);
  if (rule) return rule;

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[certificates] Published certificate id=${cert.id} "${cert.name}" (certNumber="${cert.certNumber ?? ''}") ` +
        'did not match any rule in lib/certificates/display-config.ts — showing it under "Unclassified Documents". ' +
        'Add a rule (keyed by certNumber, or issuingAuthority+name if the document has no number) once its scope is confirmed.',
    );
  }
  return UNCLASSIFIED_META;
}

/** 按匹配到的规则去重：同一份证书的重复发布记录只展示一次（就算后台意外同时发布了两条） */
export function dedupeByRule<T extends CertificateLike>(certificates: T[]): T[] {
  const seenRules = new Set<CertificateRule>();
  const seenUnclassifiedIds = new Set<number>();
  const result: T[] = [];
  for (const cert of certificates) {
    const rule = findRule(cert);
    if (rule) {
      if (seenRules.has(rule)) continue;
      seenRules.add(rule);
    } else {
      // 没匹配到规则的证书之间不互相去重（各自都是独立的、需要人工确认的文件）
      if (seenUnclassifiedIds.has(cert.id)) continue;
      seenUnclassifiedIds.add(cert.id);
    }
    result.push(cert);
  }
  return result;
}

export function localizeCertMeta(meta: CertificateDisplayMeta, locale: Locale) {
  return {
    group: meta.group,
    productType: meta.productType ? (locale === 'es' ? meta.productType.es : meta.productType.en) : null,
    models: meta.models,
    status: meta.status ? (locale === 'es' ? meta.status.es : meta.status.en) : null,
    expiredOn: meta.expiredOn ? (locale === 'es' ? meta.expiredOn.es : meta.expiredOn.en) : null,
  };
}
