import { adminFetch } from '@/lib/api/admin-client';
import { SeoSettingsForm } from './SeoSettingsForm';

interface Settings {
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOgImage: string | null;
}

export default async function AdminSeoSettingsPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">SEO 设置</h1>
      <div className="mt-6">
        <SeoSettingsForm initialValues={data} />
      </div>
    </div>
  );
}
