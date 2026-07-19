import { adminFetch } from '@/lib/api/admin-client';
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
      <h1 className="text-2xl font-semibold text-navy-950">首页模块管理</h1>
      <p className="mt-1 text-sm text-grey-500">编辑首页 Banner、核心优势、数据统计、OEM 流程、工厂数据与合作区域等模块内容。</p>
      <div className="mt-6">
        <HomepageForm initialValues={data} />
      </div>
    </div>
  );
}
