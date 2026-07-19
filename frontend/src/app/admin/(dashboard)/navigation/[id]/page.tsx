import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { NavItemForm } from '../NavItemForm';
import { updateNavItemAction } from '@/lib/actions/admin/navigation';

interface Detail {
  id: number;
  label: string;
  url: string;
  sortOrder: number;
  visible: boolean;
  openInNewTab: boolean;
}

export default async function EditNavItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: items } = await adminFetch<Detail[]>('/navigation');
  const item = items.find((i) => i.id === Number(id));
  if (!item) notFound();

  const boundAction = updateNavItemAction.bind(null, Number(id));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑菜单项</h1>
      <div className="mt-6">
        <NavItemForm action={boundAction} initialValues={item} />
      </div>
    </div>
  );
}
