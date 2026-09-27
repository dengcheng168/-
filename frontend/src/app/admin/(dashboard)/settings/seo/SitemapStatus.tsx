'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/admin/ui/badge';

type Status = 'checking' | 'connected' | 'error';

export function SitemapStatus({ sitemapUrl, robotsUrl }: { sitemapUrl: string; robotsUrl: string }) {
  const [status, setStatus] = useState<Status>('checking');
  const [robotsStatus, setRobotsStatus] = useState<Status>('checking');
  const [urlCount, setUrlCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    // 用相对路径同源请求，不受 NEXT_PUBLIC_SITE_URL 与当前访问域名是否一致影响
    fetch('/sitemap.xml', { cache: 'no-store' })
      .then(async (res) => {
        const body = res.ok ? await res.text() : '';
        if (!cancelled) {
          setStatus(res.ok ? 'connected' : 'error');
          setUrlCount(res.ok ? (body.match(/<loc>/g) ?? []).length : null);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    fetch('/robots.txt', { cache: 'no-store' })
      .then((res) => {
        if (!cancelled) setRobotsStatus(res.ok ? 'connected' : 'error');
      })
      .catch(() => {
        if (!cancelled) setRobotsStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-4xl space-y-4 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">搜索引擎抓取状态</h2>
        <p className="mt-1 text-xs text-muted-foreground">实时检查 Sitemap 与 robots.txt 是否能够正常访问。</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">Sitemap</span><Badge variant={status === 'connected' ? 'success' : status === 'error' ? 'destructive' : 'muted'}>{status === 'connected' ? `${urlCount ?? 0} 个 URL` : status === 'error' ? '访问失败' : '检测中...'}</Badge></div>
          <a href={sitemapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-xs text-water-600 hover:underline">{sitemapUrl}</a>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">robots.txt</span><Badge variant={robotsStatus === 'connected' ? 'success' : robotsStatus === 'error' ? 'destructive' : 'muted'}>{robotsStatus === 'connected' ? '可访问' : robotsStatus === 'error' ? '访问失败' : '检测中...'}</Badge></div>
          <a href={robotsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-xs text-water-600 hover:underline">{robotsUrl}</a>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Sitemap 由系统自动生成并包含已发布内容；将其提交到 Google Search Console 和 Bing Webmaster Tools 即可。</p>
    </div>
  );
}
