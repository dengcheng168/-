import { adminFetch } from '@/lib/api/admin-client';
import { ContactSettingsForm } from './ContactSettingsForm';

interface Settings {
  companyName: string;
  companyLogoUrl: string | null;
  companyAddress: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
}

export default async function AdminContactSettingsPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">联系方式设置</h1>
      <div className="mt-6">
        <ContactSettingsForm initialValues={data} />
      </div>
    </div>
  );
}
