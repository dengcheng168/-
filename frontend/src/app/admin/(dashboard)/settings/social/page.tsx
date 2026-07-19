import { adminFetch } from '@/lib/api/admin-client';
import { SOCIAL_PLATFORMS } from '@/lib/constants/social-platforms';
import type { SocialLink } from '@/types/settings';
import { PageHeader } from '@/components/admin/PageHeader';
import { SocialSettingsForm } from './SocialSettingsForm';

interface Settings {
  socialLinks: SocialLink[];
}

export default async function AdminSocialSettingsPage() {
  const { data } = await adminFetch<Settings>('/settings');

  const existing = new Map(data.socialLinks.map((item) => [item.platform, item]));
  const links: SocialLink[] = SOCIAL_PLATFORMS.map(({ platform, label }) => {
    const found = existing.get(platform);
    return {
      platform,
      label,
      url: found?.url ?? '',
      enabled: found?.enabled ?? false,
    };
  });

  return (
    <div>
      <PageHeader
        title="社交媒体"
        description='填写各平台主页链接，勾选"启用"后才会显示在前台页脚。未启用的链接可以先保存，不会展示给访客。'
      />
      <div>
        <SocialSettingsForm initialValues={links} />
      </div>
    </div>
  );
}
