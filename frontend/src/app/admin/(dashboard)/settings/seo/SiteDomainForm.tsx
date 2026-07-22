'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { Badge } from '@/components/admin/ui/badge';
import { updateSiteBaseUrlAction } from '@/lib/actions/admin/settings';
import type { SiteBaseUrlSource } from '@/lib/site/get-site-base-url';

const SOURCE_LABELS: Record<SiteBaseUrlSource, string> = {
  DATABASE: '后台配置',
  SITE_URL: 'SITE_URL 环境变量回退',
  LEGACY_NEXT_PUBLIC_SITE_URL: '旧 NEXT_PUBLIC_SITE_URL 兼容回退（计划后续版本移除）',
  DEVELOPMENT_DEFAULT: '开发环境默认值',
};

interface Props {
  currentValue: string | null;
  resolvedUrl: string;
  resolvedSource: SiteBaseUrlSource;
  canEdit: boolean;
  lastModifiedBy: string | null;
  lastModifiedAt: string | null;
}

export function SiteDomainForm({ currentValue, resolvedUrl, resolvedSource, canEdit, lastModifiedBy, lastModifiedAt }: Props) {
  const [state, formAction, pending] = useActionState(updateSiteBaseUrlAction, {});

  return (
    <div className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">正式站点域名</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          用于生成 Sitemap、Canonical、hreflang、Open Graph 和 JSON-LD 中的绝对链接。修改此项不会自动配置 DNS、SSL 或反向代理。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>当前生效地址：</span>
        <a href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="text-water-600 hover:underline">
          {resolvedUrl}
        </a>
        <Badge variant={resolvedSource === 'DATABASE' ? 'success' : 'warning'}>来源：{SOURCE_LABELS[resolvedSource]}</Badge>
      </div>

      {lastModifiedAt && (
        <p className="text-xs text-muted-foreground">
          最后修改：{new Date(lastModifiedAt).toLocaleString('zh-CN')}
          {lastModifiedBy ? ` · ${lastModifiedBy}` : ''}
        </p>
      )}

      {!canEdit && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          只有超级管理员可以修改正式站点域名，当前账号只能查看。
        </p>
      )}

      <form action={formAction} className="space-y-3">
        <FormField
          label="正式站点域名"
          htmlFor="siteBaseUrl"
          hint="请输入完整 HTTPS 地址（例如 https://koigatetech.com），不要填写页面路径，不要填写末尾斜杠。留空表示清除后台配置，回退使用 SITE_URL 环境变量。"
        >
          <input
            id="siteBaseUrl"
            name="siteBaseUrl"
            placeholder="https://koigatetech.com"
            defaultValue={currentValue ?? ''}
            disabled={!canEdit}
            className={fieldInputClasses}
          />
        </FormField>

        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          修改域名前应确保新域名的 DNS、SSL 证书和（如果是更换首选域名）301 重定向已经准备好——这里只控制网站生成的绝对
          URL，不负责服务器网络配置。保存后会自动刷新全站 SEO 缓存，下一次请求即可生效，无需重新构建部署。
        </p>

        {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        {canEdit && (
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60"
          >
            {pending ? '保存中...' : '保存'}
          </button>
        )}
      </form>
    </div>
  );
}
