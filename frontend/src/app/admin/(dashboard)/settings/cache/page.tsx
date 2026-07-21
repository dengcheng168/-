import { getCurrentAdmin } from '@/lib/auth/session';
import { PageHeader } from '@/components/admin/PageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { CacheActions } from './CacheActions';

export default async function AdminCacheSettingsPage() {
  const user = await getCurrentAdmin();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_ADMIN')) {
    return <AdminForbidden message="缓存管理只有超级管理员和内容管理员可以访问。" />;
  }

  const intervalHours = Number(process.env.CACHE_AUTO_CLEAR_INTERVAL_HOURS) || 24;

  return (
    <div>
      <PageHeader title="缓存管理" description="查看前台缓存机制说明，需要时手动清除全站缓存。" />
      <div className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            首页等营销页面使用 Next.js 增量式静态生成（ISR），保存后台内容后会自动刷新对应页面的缓存，
            无需手动操作；产品、博客等页面每次访问都会向后端请求最新数据，不受这个缓存影响。
          </p>
          <p>
            系统每 {intervalHours} 小时还会自动清理一次全站缓存作为兜底，不需要人工干预
            （间隔可以在部署环境变量 CACHE_AUTO_CLEAR_INTERVAL_HOURS 里调整）。
          </p>
          <p>
            如果怀疑前台显示的内容不是最新的（例如直接在数据库里改过数据，或不想等下一次自动清理），
            可以点击下面的按钮立即手动清除全站缓存，所有页面会在下次被访问时重新生成。
          </p>
        </div>
        <CacheActions />
      </div>
    </div>
  );
}
