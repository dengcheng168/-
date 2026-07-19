import { adminFetch } from '@/lib/api/admin-client';
import { FooterForm } from './FooterForm';

interface Settings {
  footerText: string | null;
}

export default async function AdminFooterPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">页脚设置</h1>
      <p className="mt-1 text-sm text-slate-500">
        页脚的"Quick Navigation"栏目会自动跟随"导航菜单"设置，"Categories"栏目会自动跟随产品分类，无需在这里单独配置。
      </p>
      <div className="mt-6">
        <FooterForm initialValues={data} />
      </div>
    </div>
  );
}
