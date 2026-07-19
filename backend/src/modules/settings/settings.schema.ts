import { z } from 'zod';

export const seoSettingsSchema = z.object({
  defaultSeoTitle: z.string().optional(),
  defaultSeoDescription: z.string().optional(),
  defaultOgImage: z.string().optional(),
});

export const contactSettingsSchema = z.object({
  companyName: z.string().optional(),
  companyLogoUrl: z.string().optional(),
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
});

export const turnstileSettingsSchema = z.object({
  turnstileEnabled: z.boolean().optional(),
  turnstileSiteKey: z.string().optional(),
  turnstileSecretKey: z.string().optional(),
});
