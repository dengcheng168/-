import { adminFetch } from '@/lib/api/admin-client';
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
      <h1 className="text-2xl font-semibold text-navy-950">SMTP 邮件设置</h1>
      <p className="mt-1 text-sm text-grey-500">用于收到新询盘时发送邮件提醒，不配置则不启用。</p>
      <div className="mt-6">
        <SmtpSettingsForm initialValues={data} />
      </div>
    </div>
  );
}
