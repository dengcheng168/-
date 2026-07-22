import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { FooterForm } from './FooterForm';

interface Settings {
  footerText: string | null;
  footerCompanyIntro: string | null;
}

export default async function AdminFooterPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <PageHeader
        title="页脚设置"
        description='页脚的"Quick Navigation"栏目会自动跟随"导航菜单"设置，"Categories"栏目会自动跟随产品分类，无需在这里单独配置。'
      />
      <div>
        <FooterForm initialValues={data} />
      </div>
    </div>
  );
}
