import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { deleteNavItemAction } from '@/lib/actions/admin/navigation';

interface Row {
  id: number;
  label: string;
  url: string;
  sortOrder: number;
  visible: boolean;
}

export default async function AdminNavigationPage() {
  const { data } = await adminFetch<Row[]>('/navigation');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-950">导航菜单管理</h1>
        <Link href="/admin/navigation/new" className="rounded-md bg-water-500 px-4 py-2 text-sm font-medium text-white hover:bg-water-600">
          + 新增菜单项
        </Link>
      </div>

      <div className="mt-6">
        <AdminTable>
          <AdminTableHead columns={['名称', '链接', '排序', '显示', '操作']} />
          <tbody>
            {data.length === 0 && <AdminEmptyRow colSpan={5} />}
            {data.map((row) => (
              <tr key={row.id} className="border-b border-grey-100 last:border-none">
                <td className="px-4 py-3 font-medium text-navy-950">{row.label}</td>
                <td className="px-4 py-3 text-grey-500">{row.url}</td>
                <td className="px-4 py-3 text-grey-500">{row.sortOrder}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${row.visible ? 'bg-green-100 text-green-700' : 'bg-grey-100 text-grey-700'}`}>
                    {row.visible ? '显示' : '隐藏'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/navigation/${row.id}`} className="text-water-600 hover:underline">
                      编辑
                    </Link>
                    <form action={deleteNavItemAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmSubmitButton confirmMessage={`确定要删除菜单项"${row.label}"吗？`} className="text-red-600 hover:underline">
                        删除
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </div>
    </div>
  );
}
