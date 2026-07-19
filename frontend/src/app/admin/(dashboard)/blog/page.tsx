import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { deleteBlogPostAction } from '@/lib/actions/admin/blog';

interface Row {
  id: number;
  title: string;
  status: string;
  publishedAt: string | null;
  category?: { name: string };
}

export default async function AdminBlogPage() {
  const { data } = await adminFetch<Row[]>('/blog?pageSize=100');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-950">博客文章管理</h1>
        <Link href="/admin/blog/new" className="rounded-md bg-water-500 px-4 py-2 text-sm font-medium text-white hover:bg-water-600">
          + 新增文章
        </Link>
      </div>

      <div className="mt-6">
        <AdminTable>
          <AdminTableHead columns={['标题', '分类', '状态', '操作']} />
          <tbody>
            {data.length === 0 && <AdminEmptyRow colSpan={4} />}
            {data.map((row) => (
              <tr key={row.id} className="border-b border-grey-100 last:border-none">
                <td className="px-4 py-3 font-medium text-navy-950">{row.title}</td>
                <td className="px-4 py-3 text-grey-500">{row.category?.name ?? '-'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/blog/${row.id}`} className="text-water-600 hover:underline">
                      编辑
                    </Link>
                    <form action={deleteBlogPostAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmSubmitButton confirmMessage={`确定要删除文章"${row.title}"吗？`} className="text-red-600 hover:underline">
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
