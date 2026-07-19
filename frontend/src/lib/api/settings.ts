import { apiFetch } from './client';
import { resolveMediaUrl } from '@/lib/utils/media';
import type { PublicSiteSettings } from '@/types/settings';

/**
 * Docker 构建时前端与后端处于隔离的构建网络中，可能暂时连不上后端（见部署文档说明）。
 * 这里给出兜底默认值，保证 `next build` 静态生成阶段不会因为后端不可达而整体失败——
 * 页面会先用占位内容完成预渲染，容器启动后由 ISR（revalidate）在首次真实请求时刷新为最新内容。
 */
const FALLBACK_SETTINGS: PublicSiteSettings = {
  companyName: 'Water Purifier Factory',
  companyLogoUrl: null,
  companyAddress: null,
  companyEmail: null,
  companyPhone: null,
  whatsappNumber: null,
  whatsappLink: null,
  socialLinks: [],
  turnstileEnabled: false,
  turnstileSiteKey: null,
  defaultSeoTitle: null,
  defaultSeoDescription: null,
  defaultOgImage: null,
  heroHeadline: 'OEM & ODM Water Purifier Manufacturer',
  heroSubheadline: 'Reliable water purification solutions for global brands, distributors and commercial projects.',
  heroButton1Text: 'Get a Quote',
  heroButton1Link: '/contact',
  heroButton2Text: 'View Products',
  heroButton2Link: '/products',
  heroDesktopImage: null,
  heroMobileImage: null,
  coreAdvantages: [],
  stats: [],
  oemProcessSteps: [],
  factoryStats: [],
  factoryPhotos: [],
  partnerRegions: [],
  footerText: null,
  footerColumns: null,
};

function resolveSettingsMedia(settings: PublicSiteSettings): PublicSiteSettings {
  return {
    ...settings,
    companyLogoUrl: settings.companyLogoUrl ? resolveMediaUrl(settings.companyLogoUrl) : settings.companyLogoUrl,
    heroDesktopImage: settings.heroDesktopImage ? resolveMediaUrl(settings.heroDesktopImage) : settings.heroDesktopImage,
    heroMobileImage: settings.heroMobileImage ? resolveMediaUrl(settings.heroMobileImage) : settings.heroMobileImage,
    defaultOgImage: settings.defaultOgImage ? resolveMediaUrl(settings.defaultOgImage) : settings.defaultOgImage,
    factoryPhotos: settings.factoryPhotos.map((p) => resolveMediaUrl(p)),
  };
}

export async function getPublicSettings(): Promise<PublicSiteSettings> {
  try {
    const { data } = await apiFetch<PublicSiteSettings>('/settings/public', {
      revalidate: 300,
      tags: ['settings'],
    });
    return resolveSettingsMedia(data);
  } catch {
    return FALLBACK_SETTINGS;
  }
}
