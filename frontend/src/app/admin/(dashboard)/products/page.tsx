import Link from 'next/link';
import Image from 'next/image';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PageHeader } from '@/components/admin/PageHeader';
import { IconPlus } from '@/components/admin/icons';
import { deleteProductAction } from '@/lib/actions/admin/products';
import { resolveMediaUrl } from '@/lib/utils/media';

interface Row {
  id: number;
  name: string;
  mainImage: string;
  status: string;
  featured: boolean;
  sortOrder: number;
  category?: { name: string };
}

export default async function AdminProductsPage() {
  const { data } = await adminFetch<Row[]>('/products?pageSize=100');

  return (
    <div>
      <PageHeader
        title="产品列表"
        description="管理产品信息、图片与发布状态。"
        action={
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 rounded-md bg-[#0a2540] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d3059]"
          >
            <IconPlus className="h-4 w-4" />
            新增产品
          </Link>
        }
      />

      <div>
        <AdminTable>
          <AdminTableHead columns={['图片', '名称', '分类', '状态', '推荐', '操作']} />
          <tbody>
            {data.length === 0 && <AdminEmptyRow colSpan={6} />}
            {data.map((row) => (
              <tr key={row.id} className="border-b border-grey-100 last:border-none">
                <td className="px-4 py-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md bg-grey-50">
                    <Image src={resolveMediaUrl(row.mainImage)} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-navy-950">{row.name}</td>
                <td className="px-4 py-3 text-grey-500">{row.category?.name ?? '-'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-grey-500">{row.featured ? '是' : '否'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/products/${row.id}`} className="text-water-600 hover:underline">
                      编辑
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmSubmitButton confirmMessage={`确定要删除产品"${row.name}"吗？`} className="text-red-600 hover:underline">
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
