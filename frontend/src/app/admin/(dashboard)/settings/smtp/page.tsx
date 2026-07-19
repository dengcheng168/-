import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { SmtpSettingsForm } from './SmtpSettingsForm';

interface Settings {
  smtpEnabled: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpFromEmail: string | null;
}

export default async function AdminSmtpSettingsPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <PageHeader title="SMTP 邮件" description="用于收到新询盘时发送邮件提醒，不配置则不启用。" />
      <div>
        <SmtpSettingsForm initialValues={data} />
      </div>
    </div>
  );
}
