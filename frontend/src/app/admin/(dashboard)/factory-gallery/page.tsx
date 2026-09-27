import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { PageHeader } from '@/components/admin/PageHeader';
import { IconPlus } from '@/components/admin/icons';
import { SortOrderInput } from '@/components/admin/SortOrderInput';
import { deleteFactoryGalleryItemAction, setFactoryGalleryItemSortOrderAction } from '@/lib/actions/admin/factory-gallery';
import { GALLERY_GROUP_LABEL, GALLERY_GROUP_SEQUENCE, legacyGalleryGroup, type GalleryGroup } from '@/lib/about/gallery-groups';

interface Row {
  id: number;
  title: string;
  imageUrl: string | null;
  galleryGroup: GalleryGroup;
  sortOrder: number;
  published: boolean;
}

export default async function AdminFactoryGalleryPage() {
  const { data } = await adminFetch<Row[]>('/factory-gallery?pageSize=100');

  return (
    <div>
      <PageHeader
        title="工厂展示图"
        description="图片按下面三个分类独立管理，每个分类的排序都从 1 开始。进入对应分类添加图片，前台 About Us 页面会按相同分类分别展示。"
      />

      <div className="space-y-10">
        {GALLERY_GROUP_SEQUENCE.map((group) => {
          const rows = data.filter((row) => (row.galleryGroup ?? legacyGalleryGroup(row.id)) === group);
          return (
            <section key={group} className="overflow-hidden rounded-lg border border-grey-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grey-200 bg-grey-50 px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-navy-950">
                    {group === 'manufacturing' && 'Manufacturing Workflow'}
                    {group === 'quality' && 'Quality Control & Testing'}
                    {group === 'visits' && 'Customer Visits & Cooperation'}
                  </h2>
                  <p className="mt-1 text-sm text-grey-500">{GALLERY_GROUP_LABEL[group]} · {rows.length} 张图片</p>
                </div>
                <Link
                  href={`/admin/factory-gallery/new?group=${group}`}
                  className="flex items-center gap-1.5 rounded-md bg-[#0a2540] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d3059]"
                >
                  <IconPlus className="h-4 w-4" />
                  添加到此分类
                </Link>
              </div>
              <AdminTable>
                <AdminTableHead columns={['标题', '图片', '排序', '状态', '操作']} />
                <tbody>
                  {rows.length === 0 && <AdminEmptyRow colSpan={5} />}
                  {rows.map((row) => (
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
                          <Link href={`/admin/factory-gallery/${row.id}`} className="text-water-600 hover:underline">编辑</Link>
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
            </section>
          );
        })}
      </div>
    </div>
  );
}
