import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { deleteCertificateAction } from '@/lib/actions/admin/certificates';

interface Row {
  id: number;
  name: string;
  certType: string | null;
  sortOrder: number;
  published: boolean;
}

export default async function AdminCertificatesPage() {
  const { data } = await adminFetch<Row[]>('/certificates?pageSize=100');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-950">证书管理</h1>
        <Link href="/admin/certificates/new" className="rounded-md bg-water-500 px-4 py-2 text-sm font-medium text-white hover:bg-water-600">
          + 新增证书
        </Link>
      </div>

      <div className="mt-6">
        <AdminTable>
          <AdminTableHead columns={['名称', '类型', '排序', '状态', '操作']} />
          <tbody>
            {data.length === 0 && <AdminEmptyRow colSpan={5} />}
            {data.map((row) => (
              <tr key={row.id} className="border-b border-grey-100 last:border-none">
                <td className="px-4 py-3 font-medium text-navy-950">{row.name}</td>
                <td className="px-4 py-3 text-grey-500">{row.certType ?? '-'}</td>
                <td className="px-4 py-3 text-grey-500">{row.sortOrder}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${row.published ? 'bg-green-100 text-green-700' : 'bg-grey-100 text-grey-700'}`}>
                    {row.published ? '已发布' : '未发布'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/certificates/${row.id}`} className="text-water-600 hover:underline">
                      编辑
                    </Link>
                    <form action={deleteCertificateAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmSubmitButton confirmMessage={`确定要删除证书"${row.name}"吗？`} className="text-red-600 hover:underline">
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
