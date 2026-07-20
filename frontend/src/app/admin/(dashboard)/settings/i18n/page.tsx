import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { TranslationsForm } from './TranslationsForm';

interface HeroSettings {
  heroHeadline: string;
  heroSubheadline: string;
  heroButton1Text: string;
  heroButton2Text: string;
}

interface NavItem {
  id: number;
  label: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default async function AdminI18nSettingsPage() {
  const [{ data: settings }, { data: navItems }, { data: faqs }, { data: translations }] = await Promise.all([
    adminFetch<HeroSettings>('/settings'),
    adminFetch<NavItem[]>('/navigation'),
    adminFetch<FaqItem[]>('/faqs?pageSize=100'),
    adminFetch<Record<string, string>>('/translations?locale=es'),
  ]);

  return (
    <div>
      <PageHeader
        title="多语言设置"
        description="目前支持西班牙语（/es）。下面每一项左侧是英文原文（只读），右侧填写西班牙语译文；留空表示暂不翻译，前台会自动显示英文原文，不会出现空白。"
      />
      <TranslationsForm
        settings={settings}
        navItems={navItems}
        faqs={faqs}
        translations={translations}
      />
    </div>
  );
}
