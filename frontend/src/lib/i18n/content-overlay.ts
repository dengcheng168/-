import { translate } from '@/lib/api/translations';
import type { NavigationItem } from '@/types/navigation';
import type { Faq } from '@/types/content';
import type { PublicSiteSettings } from '@/types/settings';

/**
 * 把 Translation 表里的西班牙语覆盖叠加到英文原始内容上——没有对应译文的字段自动回退显示英文，
 * 不会出现空白或占位符。key 命名和后台"多语言设置"编辑页（admin/settings/i18n）使用的完全一致。
 */
export function localizeNavigation(items: NavigationItem[], map: Record<string, string>): NavigationItem[] {
  return items.map((item) => ({ ...item, label: translate(map, `nav.${item.id}.label`, item.label) }));
}

export function localizeFaqs(faqs: Faq[], map: Record<string, string>): Faq[] {
  return faqs.map((faq) => ({
    ...faq,
    question: translate(map, `faq.${faq.id}.question`, faq.question),
    answer: translate(map, `faq.${faq.id}.answer`, faq.answer),
  }));
}

export function localizeHero(settings: PublicSiteSettings, map: Record<string, string>): PublicSiteSettings {
  return {
    ...settings,
    heroHeadline: translate(map, 'settings.heroHeadline', settings.heroHeadline),
    heroSubheadline: translate(map, 'settings.heroSubheadline', settings.heroSubheadline),
    heroButton1Text: translate(map, 'settings.heroButton1Text', settings.heroButton1Text),
    heroButton2Text: translate(map, 'settings.heroButton2Text', settings.heroButton2Text),
  };
}
