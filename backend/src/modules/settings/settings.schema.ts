import { z } from 'zod';

export const seoSettingsSchema = z.object({
  defaultSeoTitle: z.string().optional(),
  defaultSeoDescription: z.string().optional(),
  defaultOgImage: z.string().optional(),
});

export const contactSettingsSchema = z.object({
  companyName: z.string().optional(),
  companyLogoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  companyAddress: z.string().optional(),
  companyEmail: z.string().optional(),
  companyPhone: z.string().optional(),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1),
  label: z.string().min(1),
  url: z.string().optional().default(''),
  enabled: z.boolean().optional().default(false),
});

export const socialSettingsSchema = z.object({
  socialLinks: z.array(socialLinkSchema).optional(),
});

export const whatsappSettingsSchema = z.object({
  whatsappNumber: z.string().optional(),
  whatsappLink: z.string().optional(),
});

export const smtpSettingsSchema = z.object({
  smtpEnabled: z.boolean().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpFromEmail: z.string().optional(),
});

export const homepageSettingsSchema = z.object({
  heroHeadline: z.string().optional(),
  heroSubheadline: z.string().optional(),
  heroButton1Text: z.string().optional(),
  heroButton1Link: z.string().optional(),
  heroButton2Text: z.string().optional(),
  heroButton2Link: z.string().optional(),
  heroDesktopImage: z.string().optional(),
  heroMobileImage: z.string().optional(),
  coreAdvantages: z.array(z.unknown()).optional(),
  stats: z.array(z.unknown()).optional(),
  oemProcessSteps: z.array(z.unknown()).optional(),
  factoryStats: z.array(z.unknown()).optional(),
  factoryPhotos: z.array(z.unknown()).optional(),
  partnerRegions: z.array(z.unknown()).optional(),
});

export const footerSettingsSchema = z.object({
  footerText: z.string().optional(),
  footerColumns: z.array(z.unknown()).optional(),
  footerCompanyIntro: z.string().optional(),
});

export const turnstileSettingsSchema = z.object({
  turnstileEnabled: z.boolean().optional(),
  turnstileSiteKey: z.string().optional(),
  turnstileSecretKey: z.string().optional(),
});

/** Meta / TikTok / Google 三个像素填了 ID 会真实在前台注入追踪脚本，见各平台组件 */
export const pixelSettingsSchema = z.object({
  metaPixelId: z.string().optional(),
  tiktokPixelId: z.string().optional(),
  googlePixelId: z.string().optional(),
});

/**
 * 这里只做"形状"校验（必须是字符串或 null），真正的域名格式规则（协议/路径/query/hash/
 * localhost 等）在 settings.service.ts 的 updateSiteBaseUrl 里用 lib/site-url.ts 统一校验——
 * 因为那部分规则依赖运行环境（生产/开发）判断是否放行 localhost，不是纯粹的 schema 形状问题。
 * 传空字符串或 null 视为"清空覆盖，回退到运行时 SITE_URL"。
 */
export const siteDomainSettingsSchema = z.object({
  siteBaseUrl: z.string().nullable(),
});
