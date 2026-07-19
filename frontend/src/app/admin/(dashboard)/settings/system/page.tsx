import { adminFetch } from '@/lib/api/admin-client';

interface SystemInfo {
  nodeVersion: string;
  environment: string;
  uptimeSeconds: number;
  databaseProvider: string;
  counts: { products: number; blogPosts: number; inquiries: number; media: number };
  serverTime: string;
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h} 小时 ${m} 分钟`;
}

export default async function AdminSystemInfoPage() {
  const { data } = await adminFetch<SystemInfo>('/system/info');

  const rows: [string, string][] = [
    ['Node.js 版本', data.nodeVersion],
    ['运行环境', data.environment === 'production' ? '生产环境' : '开发环境'],
    ['数据库类型', data.databaseProvider.toUpperCase()],
    ['服务已运行', formatUptime(data.uptimeSeconds)],
    ['服务器时间', new Date(data.serverTime).toLocaleString('zh-CN')],
    ['产品数量', String(data.counts.products)],
    ['博客文章数量', String(data.counts.blogPosts)],
    ['询盘数量', String(data.counts.inquiries)],
    ['媒体文件数量', String(data.counts.media)],
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">系统信息</h1>

      <dl className="mt-6 max-w-xl divide-y divide-grey-100 rounded-lg border border-grey-200 bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex px-4 py-3 text-sm">
            <dt className="w-40 shrink-0 text-grey-500">{label}</dt>
            <dd className="text-navy-950">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 max-w-xl rounded-lg border border-grey-200 bg-grey-50 p-5 text-sm text-grey-700">
        <p className="font-medium text-navy-950">数据备份说明</p>
        <p className="mt-2">
          数据库文件位于服务器 <code className="rounded bg-white px-1 py-0.5">data/production.db</code>，上传文件位于{' '}
          <code className="rounded bg-white px-1 py-0.5">uploads/</code> 目录。请在服务器上使用{' '}
          <code className="rounded bg-white px-1 py-0.5">scripts/backup.sh</code> 定期备份，详见部署文档。
        </p>
      </div>
    </div>
  );
}
