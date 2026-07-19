import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { deleteRedirectAction } from '@/lib/actions/admin/redirects';
import { NewRedirectForm } from './NewRedirectForm';

interface Row {
  id: number;
  fromPath: string;
  toPath: string;
  statusCode: number;
}

export default async function AdminRedirectsPage() {
  const { data } = await adminFetch<Row[]>('/redirects?pageSize=100');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">301 重定向管理</h1>

      <div className="mt-6 rounded-lg border border-grey-200 bg-white p-5">
        <NewRedirectForm />
      </div>

      <div className="mt-6">
        <AdminTable>
          <AdminTableHead columns={['来源路径', '目标路径', '状态码', '操作']} />
          <tbody>
            {data.length === 0 && <AdminEmptyRow colSpan={4} />}
            {data.map((row) => (
              <tr key={row.id} className="border-b border-grey-100 last:border-none">
                <td className="px-4 py-3 font-medium text-navy-950">{row.fromPath}</td>
                <td className="px-4 py-3 text-grey-500">{row.toPath}</td>
                <td className="px-4 py-3 text-grey-500">{row.statusCode}</td>
                <td className="px-4 py-3">
                  <form action={deleteRedirectAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <ConfirmSubmitButton confirmMessage="确定要删除这条重定向规则吗？" className="text-red-600 hover:underline">
                      删除
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </div>
    </div>
  );
}
