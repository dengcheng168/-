import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { PageHeader } from '@/components/admin/PageHeader';
import { IconPlus } from '@/components/admin/icons';
import { SortOrderInput } from '@/components/admin/SortOrderInput';
import { deleteFactoryGalleryItemAction, setFactoryGalleryItemSortOrderAction } from '@/lib/actions/admin/factory-gallery';

interface Row {
  id: number;
  title: string;
  imageUrl: string | null;
  sortOrder: number;
  published: boolean;
}

export default async function AdminFactoryGalleryPage() {
  const { data } = await adminFetch<Row[]>('/factory-gallery?pageSize=100');

  return (
    <div>
      <PageHeader
        title="工厂展示图"
        description="管理 About Us 页面下方的工厂测试/客户到访图文墙，展示顺序、标题描述与图片均可编辑。"
        action={
          <Link
            href="/admin/factory-gallery/new"
            className="flex items-center gap-1.5 rounded-md bg-[#0a2540] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d3059]"
          >
            <IconPlus className="h-4 w-4" />
            新增展示图
          </Link>
        }
      />

      <div>
        <AdminTable>
          <AdminTableHead columns={['标题', '图片', '排序', '状态', '操作']} />
          <tbody>
            {data.length === 0 && <AdminEmptyRow colSpan={5} />}
            {data.map((row) => (
              <tr key={row.id} className="border-b border-grey-100 last:border-none">
                <td className="px-4 py-3 font-medium text-navy-950">{row.title}</td>
                <td className="px-4 py-3 text-grey-500">{row.imageUrl ? '已上传' : '未上传'}</td>
                <td className="px-4 py-3">
                  <SortOrderInput id={row.id} defaultValue={row.sortOrder} action={setFactoryGalleryItemSortOrderAction} />
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${row.published ? 'bg-green-100 text-green-700' : 'bg-grey-100 text-grey-700'}`}>
                    {row.published ? '已发布' : '未发布'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/factory-gallery/${row.id}`} className="text-water-600 hover:underline">
                      编辑
                    </Link>
                    <form action={deleteFactoryGalleryItemAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmSubmitButton confirmMessage={`确定要删除展示图"${row.title}"吗？`} className="text-red-600 hover:underline">
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
