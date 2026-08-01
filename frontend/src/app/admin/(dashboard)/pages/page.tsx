import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { PageHeader } from '@/components/admin/PageHeader';
import { deletePageAction } from '@/lib/actions/admin/pages';

interface Row {
  slug: string;
  title: string;
}

const PAGE_LABELS: Record<string, string> = {
  about: '关于我们',
  'privacy-policy': '隐私政策',
  'terms-of-use': '使用条款',
  contact: '联系我们',
  certificates: '证书页',
  blog: '博客列表',
  products: '产品列表',
};

export default async function AdminPagesPage() {
  const { data } = await adminFetch<Row[]>('/pages');

  return (
    <div>
      <PageHeader title="页面文案" description="编辑各静态页面的标题、正文与 SEO 信息。" />

      <div>
        <AdminTable>
          <AdminTableHead columns={['页面', 'Slug', '操作']} />
          <tbody>
            {data.map((row) => {
              // 固定的 7 个核心静态页（About/Contact 等）不允许在这里删除，避免误删导致前台路由失去内容；
              // 不在这个列表里的 slug（比如已下线页面留下的历史记录）才允许清理
              const isCorePage = row.slug in PAGE_LABELS;
              return (
                <tr key={row.slug} className="border-b border-grey-100 last:border-none">
                  <td className="px-4 py-3 font-medium text-navy-950">{PAGE_LABELS[row.slug] ?? row.title}</td>
                  <td className="px-4 py-3 text-grey-500">{row.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/pages/${row.slug}`} className="text-water-600 hover:underline">
                        编辑
                      </Link>
                      {!isCorePage && (
                        <form action={deletePageAction}>
                          <input type="hidden" name="slug" value={row.slug} />
                          <ConfirmSubmitButton
                            confirmMessage={`确定要删除页面"${PAGE_LABELS[row.slug] ?? row.title}"吗？此操作不可恢复。`}
                            className="text-red-600 hover:underline"
                          >
                            删除
                          </ConfirmSubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      </div>
    </div>
  );
}
