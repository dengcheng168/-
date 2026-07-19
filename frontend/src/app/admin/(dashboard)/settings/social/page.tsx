import { adminFetch } from '@/lib/api/admin-client';
import { SOCIAL_PLATFORMS } from '@/lib/constants/social-platforms';
import type { SocialLink } from '@/types/settings';
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
      <h1 className="text-2xl font-semibold text-navy-950">社交媒体设置</h1>
      <p className="mt-1 text-sm text-slate-500">
        填写各平台主页链接，勾选&ldquo;启用&rdquo;后才会显示在前台页脚。未启用的链接可以先保存，不会展示给访客。
      </p>
      <div className="mt-6">
        <SocialSettingsForm initialValues={links} />
      </div>
    </div>
  );
}
