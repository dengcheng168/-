import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { PixelSettingsForm } from './PixelSettingsForm';

interface Settings {
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  googlePixelId: string | null;
  googleAdsId: string | null;
}

export default async function AdminPixelSettingsPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <PageHeader title="像素设置" description="分别配置 GA4、Google Ads、Meta 和 TikTok 的追踪 ID。" />
      <PixelSettingsForm initialValues={data} />
    </div>
  );
}
