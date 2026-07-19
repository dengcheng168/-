export interface CoreAdvantage {
  title: string;
  description?: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface FactoryStat {
  label: string;
  value: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface PublicSiteSettings {
  companyName: string;
  companyLogoUrl: string | null;
  companyAddress: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  whatsappNumber: string | null;
  whatsappLink: string | null;
  socialLinks: SocialLink[];
  turnstileEnabled: boolean;
  turnstileSiteKey: string | null;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOgImage: string | null;
  heroHeadline: string;
  heroSubheadline: string;
  heroButton1Text: string;
  heroButton1Link: string;
  heroButton2Text: string;
  heroButton2Link: string;
  heroDesktopImage: string | null;
  heroMobileImage: string | null;
  coreAdvantages: CoreAdvantage[];
  stats: StatItem[];
  oemProcessSteps: string[];
  factoryStats: FactoryStat[];
  factoryPhotos: string[];
  partnerRegions: string[];
  footerText: string | null;
  footerColumns: FooterColumn[] | null;
  footerCompanyIntro: string | null;
}
