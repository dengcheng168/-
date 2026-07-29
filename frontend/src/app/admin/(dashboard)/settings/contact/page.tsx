import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { ContactSettingsForm } from './ContactSettingsForm';

interface Settings {
  companyName: string;
  companyLogoUrl: string | null;
  faviconUrl: string | null;
  companyAddress: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
}

export default async function AdminContactSettingsPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <PageHeader title="网站基础设置" description="配置公司名称、Logo 与联系方式，展示在网站页头、页脚与联系页面。" />
      <div>
        <ContactSettingsForm initialValues={data} />
      </div>
    </div>
  );
}
