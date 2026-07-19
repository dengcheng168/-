import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { WhatsappSettingsForm } from './WhatsappSettingsForm';

interface Settings {
  whatsappNumber: string | null;
  whatsappLink: string | null;
}

export default async function AdminWhatsappSettingsPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <PageHeader title="WhatsApp" description="配置 WhatsApp 联系号码，用于网站悬浮按钮与产品咨询入口。" />
      <div>
        <WhatsappSettingsForm initialValues={data} />
      </div>
    </div>
  );
}
