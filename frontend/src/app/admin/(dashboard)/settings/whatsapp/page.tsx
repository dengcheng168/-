import { adminFetch } from '@/lib/api/admin-client';
import { WhatsappSettingsForm } from './WhatsappSettingsForm';

interface Settings {
  whatsappNumber: string | null;
  whatsappLink: string | null;
}

export default async function AdminWhatsappSettingsPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">WhatsApp 设置</h1>
      <div className="mt-6">
        <WhatsappSettingsForm initialValues={data} />
      </div>
    </div>
  );
}
