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
  coreAdvantages: unknown;
  stats: unknown;
  oemProcessSteps: unknown;
  factoryStats: unknown;
  factoryPhotos: unknown;
  partnerRegions: unknown;
}

export default async function AdminHomepagePage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <PageHeader title="首页模块" description="编辑首页 Banner、核心优势、数据统计、OEM 流程、工厂数据与合作区域等模块内容。" />
      <div>
        <HomepageForm initialValues={data} />
      </div>
    </div>
  );
}
