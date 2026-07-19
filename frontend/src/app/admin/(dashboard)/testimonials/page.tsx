import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { deleteTestimonialAction } from '@/lib/actions/admin/testimonials';

interface Row {
  id: number;
  authorName: string;
  companyName: string | null;
  sortOrder: number;
  published: boolean;
}

export default async function AdminTestimonialsPage() {
  const { data } = await adminFetch<Row[]>('/testimonials?pageSize=100');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-950">客户评价管理</h1>
        <Link href="/admin/testimonials/new" className="rounded-md bg-water-500 px-4 py-2 text-sm font-medium text-white hover:bg-water-600">
          + 新增评价
        </Link>
      </div>

      <div className="mt-6">
        <AdminTable>
          <AdminTableHead columns={['姓名', '公司', '排序', '状态', '操作']} />
          <tbody>
            {data.length === 0 && <AdminEmptyRow colSpan={5} />}
            {data.map((row) => (
              <tr key={row.id} className="border-b border-grey-100 last:border-none">
                <td className="px-4 py-3 font-medium text-navy-950">{row.authorName}</td>
                <td className="px-4 py-3 text-grey-500">{row.companyName ?? '-'}</td>
                <td className="px-4 py-3 text-grey-500">{row.sortOrder}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${row.published ? 'bg-green-100 text-green-700' : 'bg-grey-100 text-grey-700'}`}>
                    {row.published ? '已发布' : '未发布'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/testimonials/${row.id}`} className="text-water-600 hover:underline">
                      编辑
                    </Link>
                    <form action={deleteTestimonialAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmSubmitButton confirmMessage="确定要删除这条评价吗？" className="text-red-600 hover:underline">
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
