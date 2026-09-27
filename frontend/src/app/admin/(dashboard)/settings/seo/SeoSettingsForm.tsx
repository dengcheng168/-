'use client';

import { useActionState, useState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Badge } from '@/components/admin/ui/badge';
import { updateSeoSettingsAction } from '@/lib/actions/admin/settings';

interface Values {
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOgImage: string | null;
  googleSiteVerification: string | null;
}

export function SeoSettingsForm({ initialValues }: { initialValues: Values }) {
  const [state, formAction, pending] = useActionState(updateSeoSettingsAction, {});
  const [title, setTitle] = useState(initialValues.defaultSeoTitle ?? '');
  const [description, setDescription] = useState(initialValues.defaultSeoDescription ?? '');
  const titleHealthy = title.length >= 30 && title.length <= 60;
  const descriptionHealthy = description.length >= 120 && description.length <= 160;

  return (
    <form action={formAction} className="max-w-4xl space-y-6 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">全站默认搜索信息</h2>
        <p className="mt-1 text-xs text-muted-foreground">页面未单独填写 SEO 信息时使用。产品、分类、文章和静态页面中的独立设置优先级更高。</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <FormField
            label={<span className="flex items-center justify-between gap-3"><span>默认 SEO 标题</span><Badge variant={titleHealthy ? 'success' : 'warning'}>{title.length}/60</Badge></span>}
            htmlFor="defaultSeoTitle"
            hint="建议 30–60 个字符，包含核心产品词和品牌名。"
          >
            <input id="defaultSeoTitle" name="defaultSeoTitle" value={title} onChange={(event) => setTitle(event.target.value)} className={fieldInputClasses} />
          </FormField>
          <FormField
            label={<span className="flex items-center justify-between gap-3"><span>默认 SEO 描述</span><Badge variant={descriptionHealthy ? 'success' : 'warning'}>{description.length}/160</Badge></span>}
            htmlFor="defaultSeoDescription"
            hint="建议 120–160 个字符，说明产品范围、OEM/ODM 能力并加入询盘行动语。"
          >
            <textarea id="defaultSeoDescription" name="defaultSeoDescription" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} className={fieldInputClasses} />
          </FormField>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-foreground">Google 搜索结果预览</span>
            <Badge variant={titleHealthy && descriptionHealthy ? 'success' : 'warning'}>{titleHealthy && descriptionHealthy ? '长度合适' : '建议调整'}</Badge>
          </div>
          <div className="text-xs text-emerald-700">https://koigatetech.com</div>
          <div className="mt-1 line-clamp-1 text-lg text-blue-700">{title || '请填写默认 SEO 标题'}</div>
          <p className="mt-1 line-clamp-3 text-sm leading-5 text-muted-foreground">{description || '请填写默认 SEO 描述，预览会在这里实时显示。'}</p>
        </div>
      </div>

      <div className="grid gap-6 border-t border-border pt-6 lg:grid-cols-2">
        <ImageUploader
          name="defaultOgImage"
          label="默认 Open Graph 图片"
          defaultValue={initialValues.defaultOgImage}
          recommendedSize="建议 1200×630px（Open Graph 标准尺寸）"
          aspectRatio={1200 / 630}
        />
        <FormField
          label="Google Search Console 验证码"
          htmlFor="googleSiteVerification"
          hint='选择“HTML 标签”验证方式，只粘贴 content="..." 中的代码，不要粘贴整个标签。'
        >
          <input id="googleSiteVerification" name="googleSiteVerification" defaultValue={initialValues.googleSiteVerification ?? ''} placeholder="例如：abcDEF123..." className={fieldInputClasses} />
        </FormField>
      </div>

      {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60">
        {pending ? '保存中...' : '保存 SEO 设置'}
      </button>
    </form>
  );
}
