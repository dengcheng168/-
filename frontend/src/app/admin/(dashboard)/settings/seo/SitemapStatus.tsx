'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/admin/ui/badge';

type Status = 'checking' | 'connected' | 'error';

export function SitemapStatus({ sitemapUrl }: { sitemapUrl: string }) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let cancelled = false;
    // 用相对路径同源请求，不受 NEXT_PUBLIC_SITE_URL 与当前访问域名是否一致影响
    fetch('/sitemap.xml', { cache: 'no-store' })
      .then((res) => {
        if (!cancelled) setStatus(res.ok ? 'connected' : 'error');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-xl space-y-2 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Sitemap</span>
        {status === 'checking' && <Badge variant="muted">检测中...</Badge>}
        {status === 'connected' && <Badge variant="success">已接入</Badge>}
        {status === 'error' && <Badge variant="destructive">未接入</Badge>}
      </div>
      <a href={sitemapUrl} target="_blank" rel="noopener noreferrer" className="block break-all text-sm text-water-600 hover:underline">
        {sitemapUrl}
      </a>
      <p className="text-xs text-muted-foreground">
        提交到 Google Search Console / Bing Webmaster 站长工具时使用此链接。由系统自动生成，包含全部已发布产品、文章与静态页面（中/英/西语言版本），无需手动维护。
      </p>
    </div>
  );
}
