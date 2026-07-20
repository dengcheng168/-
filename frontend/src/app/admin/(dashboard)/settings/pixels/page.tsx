import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { PixelSettingsForm } from './PixelSettingsForm';

interface Settings {
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  googlePixelId: string | null;
}

export default async function AdminPixelSettingsPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <PageHeader title="像素设置" description="保存 Meta / TikTok / Google 的追踪像素 ID。" />
      <PixelSettingsForm initialValues={data} />
    </div>
  );
}
