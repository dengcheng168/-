import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { fieldInputClasses } from '@/components/admin/FormField';

interface CustomerRow {
  email: string;
  name: string;
  company: string | null;
  country: string | null;
  phone: string | null;
  whatsapp: string | null;
  inquiryCount: number;
  firstContactAt: string | number;
  lastContactAt: string | number;
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  const { data } = await adminFetch<CustomerRow[]>(`/customers${qs}`);

  return (
    <div>
      <PageHeader title="客户管理" description="按邮箱汇总的客户名单，来自历史询盘记录（不含垃圾询盘），只读。" />

      <form className="mb-4 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">搜索姓名 / 邮箱 / 公司</label>
          <input name="q" defaultValue={q ?? ''} className={fieldInputClasses} />
        </div>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          搜索
        </button>
      </form>

      <AdminTable>
        <AdminTableHead columns={['姓名', '公司', '国家', '邮箱', '联系方式', '询盘次数', '首次联系', '最近联系', '操作']} />
        <tbody>
          {data.length === 0 && <AdminEmptyRow colSpan={9} />}
          {data.map((row) => (
            <tr key={row.email} className="border-b border-border last:border-none">
              <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.company ?? '-'}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.country ?? '-'}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.phone ?? row.whatsapp ?? '-'}</td>
              <td className="px-4 py-3 text-foreground">{row.inquiryCount}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(row.firstContactAt).toLocaleDateString('zh-CN')}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(row.lastContactAt).toLocaleDateString('zh-CN')}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/inquiries?q=${encodeURIComponent(row.email)}`} className="text-primary hover:underline">
                  查看询盘
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
