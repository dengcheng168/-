import { NavItemForm } from '../NavItemForm';
import { createNavItemAction } from '@/lib/actions/admin/navigation';

export default function NewNavItemPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">新增菜单项</h1>
      <div className="mt-6">
        <NavItemForm action={createNavItemAction} />
      </div>
    </div>
  );
}
