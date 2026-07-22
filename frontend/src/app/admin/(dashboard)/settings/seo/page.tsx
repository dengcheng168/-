import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { absoluteUrl } from '@/lib/seo/site';
import { SeoSettingsForm } from './SeoSettingsForm';
import { SitemapStatus } from './SitemapStatus';

interface Settings {
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOgImage: string | null;
}

export default async function AdminSeoSettingsPage() {
  const { data } = await adminFetch<Settings>('/settings');

  return (
    <div>
      <PageHeader title="SEO 设置" description="配置全站默认的搜索引擎标题、描述与分享图片。" />
      <div className="space-y-6">
        <SeoSettingsForm initialValues={data} />
        <SitemapStatus sitemapUrl={absoluteUrl('/sitemap.xml')} />
      </div>
    </div>
  );
}
