import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { HomepageForm } from './HomepageForm';

interface Settings {
  heroHeadline: string;
  heroSubheadline: string;
  heroButton1Text: string;
  heroButton1Link: string;
  heroButton2Text: string;
  heroButton2Link: string;
  heroDesktopImage: string | null;
  heroMobileImage: string | null;
  homepageVideoUrl: string | null;
  coreAdvantages: unknown;
}

export default async function AdminHomepagePage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <PageHeader title="首页模块" description="编辑首页 Banner、视频与核心优势模块内容。" />
      <div>
        <HomepageForm initialValues={data} />
      </div>
    </div>
  );
}
