import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { StatCard } from '@/components/admin/StatCard';
import { PageHeader } from '@/components/admin/PageHeader';
import { IconPackage, IconFileText, IconLayout, IconExternalLink } from '@/components/admin/icons';

interface InquiryRow {
  id: number;
  name: string;
  company: string | null;
  email: string;
  status: string;
  createdAt: string;
}

interface BlogRow {
  id: number;
  title: string;
  status: string;
  updatedAt: string;
}

async function countOf(path: string): Promise<number> {
  try {
    const separator = path.includes('?') ? '&' : '?';
    const { meta } = await adminFetch<unknown[]>(`${path}${separator}page=1&pageSize=1`);
    return meta?.total ?? 0;
  } catch {
    return 0;
  }
}

function resolveBackendBase(): string {
  const internalBase = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
  return `${internalBase}/api`;
}

async function checkSiteHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${resolveBackendBase()}/health`, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function AdminDashboardPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [products, posts, inquiriesNew, allInquiries, allPosts, apiHealthy] = await Promise.all([
    countOf('/products'),
    countOf('/blog'),
    countOf('/inquiries?status=NEW'),
    adminFetch<InquiryRow[]>('/inquiries?pageSize=100').then((r) => r.data).catch(() => [] as InquiryRow[]),
    adminFetch<BlogRow[]>('/blog?pageSize=100').then((r) => r.data).catch(() => [] as BlogRow[]),
    checkSiteHealth(),
  ]);

  const monthlyInquiries = allInquiries.filter((i) => new Date(i.createdAt) >= monthStart).length;
  const recentInquiries = allInquiries.slice(0, 5);
  const recentPosts = [...allPosts].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5);

  const cards = [
    { label: '产品总数', value: products, href: '/admin/products' },
    { label: '博客文章数量', value: posts, href: '/admin/blog' },
    { label: '未处理询盘', value: inquiriesNew, href: '/admin/inquiries?status=NEW' },
    { label: '本月询盘', value: monthlyInquiries, href: '/admin/inquiries' },
  ];

  const quickActions = [
    { label: '添加产品', href: '/admin/products/new', icon: IconPackage },
    { label: '发布文章', href: '/admin/blog/new', icon: IconFileText },
    { label: '上传媒体', href: '/admin/media', icon: IconLayout },
    { label: '查看网站', href: '/', icon: IconExternalLink, external: true },
  ];

  return (
    <div>
      <PageHeader title="数据概览" description="欢迎回来，这里是网站运营情况总览。" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111827]">最近询盘</h2>
            <Link href="/admin/inquiries" className="text-sm text-[#0a2540] hover:underline">
              查看全部
            </Link>
          </div>
          <div className="mt-3">
            <AdminTable>
              <AdminTableHead columns={['姓名', '公司', '状态', '提交时间']} />
              <tbody>
                {recentInquiries.length === 0 && <AdminEmptyRow colSpan={4} />}
                {recentInquiries.map((row) => (
                  <tr key={row.id} className="border-b border-grey-100 last:border-none">
                    <td className="px-4 py-3 font-medium text-navy-950">
                      <Link href={`/admin/inquiries/${row.id}`} className="hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-grey-500">{row.company ?? '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-grey-500">{new Date(row.createdAt).toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111827]">最近编辑的文章</h2>
            <Link href="/admin/blog" className="text-sm text-[#0a2540] hover:underline">
              查看全部
            </Link>
          </div>
          <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-white">
            {recentPosts.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[#6B7280]">暂无文章</p>
            ) : (
              recentPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/admin/blog/${post.id}`}
                  className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-[#F6F7F9] ${i > 0 ? 'border-t border-[#F1F2F4]' : ''}`}
                >
                  <span className="truncate text-[#111827]">{post.title}</span>
                  <span className="ml-3 shrink-0 text-xs text-[#6B7280]">{new Date(post.updatedAt).toLocaleDateString('zh-CN')}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#111827]">快捷操作</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-1">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                target={action.external ? '_blank' : undefined}
                className="flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#374151] hover:border-[#0a2540]/30 hover:bg-[#F6F7F9]"
              >
                <action.icon className="h-4 w-4 text-[#6B7280]" />
                {action.label}
              </Link>
            ))}
          </div>

          <h2 className="mt-6 text-sm font-semibold text-[#111827]">网站状态</h2>
          <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#374151]">API 服务</span>
              <span className={`flex items-center gap-1.5 font-medium ${apiHealthy ? 'text-green-600' : 'text-red-600'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${apiHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                {apiHealthy ? '正常运行' : '连接异常'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
