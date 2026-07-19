import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { PageHeader } from '@/components/admin/PageHeader';
import { IconPlus } from '@/components/admin/icons';
import { deleteFaqAction } from '@/lib/actions/admin/faqs';

interface Row {
  id: number;
  question: string;
  category: string | null;
  sortOrder: number;
  published: boolean;
}

export default async function AdminFaqsPage() {
  const { data } = await adminFetch<Row[]>('/faqs?pageSize=100');

  return (
    <div>
      <PageHeader
        title="FAQ 管理"
        description="管理常见问题，帮助访客快速了解产品与合作方式。"
        action={
          <Link
            href="/admin/faqs/new"
            className="flex items-center gap-1.5 rounded-md bg-[#0a2540] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d3059]"
          >
            <IconPlus className="h-4 w-4" />
            新增 FAQ
          </Link>
        }
      />

      <div>
        <AdminTable>
          <AdminTableHead columns={['问题', '分类', '排序', '状态', '操作']} />
          <tbody>
            {data.length === 0 && <AdminEmptyRow colSpan={5} />}
            {data.map((row) => (
              <tr key={row.id} className="border-b border-grey-100 last:border-none">
                <td className="px-4 py-3 font-medium text-navy-950">{row.question}</td>
                <td className="px-4 py-3 text-grey-500">{row.category ?? '-'}</td>
                <td className="px-4 py-3 text-grey-500">{row.sortOrder}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${row.published ? 'bg-green-100 text-green-700' : 'bg-grey-100 text-grey-700'}`}>
                    {row.published ? '已发布' : '未发布'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/faqs/${row.id}`} className="text-water-600 hover:underline">
                      编辑
                    </Link>
                    <form action={deleteFaqAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmSubmitButton confirmMessage="确定要删除这条 FAQ 吗？" className="text-red-600 hover:underline">
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
