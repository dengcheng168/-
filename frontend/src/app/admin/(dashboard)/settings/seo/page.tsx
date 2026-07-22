import { adminFetch } from '@/lib/api/admin-client';
import { getCurrentAdmin } from '@/lib/auth/session';
import { PageHeader } from '@/components/admin/PageHeader';
import { absoluteUrl } from '@/lib/seo/site';
import { getSiteBaseUrl } from '@/lib/site/get-site-base-url';
import { SeoSettingsForm } from './SeoSettingsForm';
import { SitemapStatus } from './SitemapStatus';
import { SiteDomainForm } from './SiteDomainForm';

interface Settings {
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOgImage: string | null;
  siteBaseUrl: string | null;
}

interface AuditLogEntry {
  adminEmail: string;
  createdAt: string;
}

export default async function AdminSeoSettingsPage() {
  const [{ data }, admin, resolved, sitemapUrl] = await Promise.all([
    adminFetch<Settings>('/settings'),
    getCurrentAdmin(),
    getSiteBaseUrl(),
    absoluteUrl('/sitemap.xml'),
  ]);
  const canEditSiteDomain = admin?.role === 'SUPER_ADMIN';

  // 操作日志只有 SUPER_ADMIN 能看（见 backend audit.routes.ts 的 LOG_VIEW_ROLES），
  // 跟能不能改域名是同一批人，这里顺带取一次"最后一次修改域名"的记录展示
  let lastModified: AuditLogEntry | null = null;
  if (canEditSiteDomain) {
    try {
      const { data: logs } = await adminFetch<AuditLogEntry[]>('/audit-logs?action=settings.site_domain_update&pageSize=1');
      lastModified = logs[0] ?? null;
    } catch {
      lastModified = null;
    }
  }

  return (
    <div>
      <PageHeader title="SEO 设置" description="配置全站默认的搜索引擎标题、描述与分享图片。" />
      <div className="space-y-6">
        <SiteDomainForm
          currentValue={data.siteBaseUrl}
          resolvedUrl={resolved.url}
          resolvedSource={resolved.source}
          canEdit={canEditSiteDomain}
          lastModifiedBy={lastModified?.adminEmail ?? null}
          lastModifiedAt={lastModified?.createdAt ?? null}
        />
        <SeoSettingsForm initialValues={data} />
        <SitemapStatus sitemapUrl={sitemapUrl} />
      </div>
    </div>
  );
}
