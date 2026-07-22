'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { TranslationMeta } from '@/components/admin/TranslationMeta';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/admin/ui/tabs';
import type { AdminFormState } from '@/lib/actions/admin/categories';
import type { TranslationFormState } from '@/lib/actions/admin/translations-shared';

interface FormValues {
  title?: string;
  bodyHtml?: string | null;
  sections?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  heroImage?: string | null;
  heroImageMobile?: string | null;
}

interface TranslationValues {
  title?: string | null;
  bodyHtml?: string | null;
  sections?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  translationStatus?: string;
  updatedAt?: string;
  updatedBy?: number | null;
}

export function PageForm({
  action,
  initialValues,
  translationAction,
  translation,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues?: FormValues;
  translationAction?: (prevState: TranslationFormState, formData: FormData) => Promise<TranslationFormState>;
  translation?: TranslationValues | null;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [esState, esFormAction, esPending] = useActionState(translationAction ?? action, {});
  const sectionsJson = initialValues?.sections != null ? JSON.stringify(initialValues.sections, null, 2) : '';
  const esSectionsJson = translation?.sections != null ? JSON.stringify(translation.sections, null, 2) : '';

  const englishForm = (
    <form action={formAction} className="max-w-3xl space-y-4">
      <FormField label="页面标题" htmlFor="title" required>
        <input id="title" name="title" defaultValue={initialValues?.title} required className={fieldInputClasses} />
      </FormField>

      <FormField label="正文内容（HTML）" htmlFor="bodyHtml" hint="支持 HTML 标签">
        <textarea id="bodyHtml" name="bodyHtml" rows={10} defaultValue={initialValues?.bodyHtml ?? ''} className={fieldInputClasses} />
      </FormField>

      <ImageUploader
        name="heroImage"
        label="顶部背景图"
        defaultValue={initialValues?.heroImage}
        recommendedSize="建议 1920×480px（宽幅横幅），不设置则该区域保持纯白背景"
        aspectRatio={4}
      />
      <ImageUploader
        name="heroImageMobile"
        label="顶部背景图（手机端）"
        defaultValue={initialValues?.heroImageMobile}
        recommendedSize="建议 1080×1350px（竖版），不设置则手机端用上面的桌面图裁切显示"
        aspectRatio={0.8}
      />

      {initialValues?.sections !== undefined && (
        <FormField label="结构化区块（JSON，谨慎编辑）" htmlFor="sectionsJson" hint="仅特定页面使用，例如工厂数据、OEM 流程步骤">
          <textarea
            id="sectionsJson"
            name="sectionsJson"
            rows={8}
            defaultValue={sectionsJson}
            className={`${fieldInputClasses} font-mono text-xs`}
          />
        </FormField>
      )}

      <FormField label="SEO 标题" htmlFor="seoTitle">
        <input id="seoTitle" name="seoTitle" defaultValue={initialValues?.seoTitle ?? ''} className={fieldInputClasses} />
      </FormField>
      <FormField label="SEO 描述" htmlFor="seoDescription">
        <textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={initialValues?.seoDescription ?? ''} className={fieldInputClasses} />
      </FormField>

      {state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60"
      >
        {pending ? '保存中...' : '保存'}
      </button>
    </form>
  );

  if (!translationAction) return englishForm;

  return (
    <Tabs defaultValue="en">
      <TabsList>
        <TabsTrigger value="en">English</TabsTrigger>
        <TabsTrigger value="es">Español</TabsTrigger>
      </TabsList>
      <TabsContent value="en">{englishForm}</TabsContent>
      <TabsContent value="es">
        <form action={esFormAction} className="max-w-3xl space-y-4">
          <TranslationMeta
            translationStatus={translation?.translationStatus}
            updatedAt={translation?.updatedAt}
            updatedBy={translation?.updatedBy}
          />

          <p className="text-xs text-muted-foreground">顶部背景图为共用字段，不分语言，请在 English 标签页维护。</p>

          <FormField label="页面标题（西班牙语）" htmlFor="es_title" hint={`英文原文：${initialValues?.title ?? ''}`}>
            <input id="es_title" name="title" defaultValue={translation?.title ?? ''} className={fieldInputClasses} />
          </FormField>

          <FormField label="正文内容（西班牙语 HTML）" htmlFor="es_bodyHtml" hint="支持 HTML 标签；留空则前台自动显示英文原文">
            <textarea id="es_bodyHtml" name="bodyHtml" rows={10} defaultValue={translation?.bodyHtml ?? ''} className={fieldInputClasses} />
          </FormField>
          {initialValues?.bodyHtml && (
            <details className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <summary className="cursor-pointer font-medium text-muted-foreground">查看英文原文（正文）</summary>
              <div className="prose prose-sm mt-2 max-w-none" dangerouslySetInnerHTML={{ __html: initialValues.bodyHtml }} />
            </details>
          )}

          {initialValues?.sections !== undefined && (
            <FormField
              label="结构化区块（西班牙语 JSON，整段覆盖）"
              htmlFor="es_sectionsJson"
              hint="留空则前台自动回退显示英文原始区块；填写需为完整合法 JSON，结构需与英文原文一致"
            >
              <textarea
                id="es_sectionsJson"
                name="sectionsJson"
                rows={8}
                defaultValue={esSectionsJson}
                className={`${fieldInputClasses} font-mono text-xs`}
              />
            </FormField>
          )}
          {initialValues?.sections !== undefined && (
            <details className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <summary className="cursor-pointer font-medium text-muted-foreground">查看英文原文（结构化区块）</summary>
              <pre className="mt-2 overflow-x-auto text-xs">{sectionsJson}</pre>
            </details>
          )}

          <FormField label="SEO 标题（西班牙语）" htmlFor="es_seoTitle" hint={`英文原文：${initialValues?.seoTitle ?? ''}`}>
            <input id="es_seoTitle" name="seoTitle" defaultValue={translation?.seoTitle ?? ''} className={fieldInputClasses} />
          </FormField>
          <FormField label="SEO 描述（西班牙语）" htmlFor="es_seoDescription" hint={`英文原文：${initialValues?.seoDescription ?? ''}`}>
            <textarea id="es_seoDescription" name="seoDescription" rows={2} defaultValue={translation?.seoDescription ?? ''} className={fieldInputClasses} />
          </FormField>

          <FormField label="翻译发布状态" htmlFor="es_translationStatus">
            <select
              id="es_translationStatus"
              name="translationStatus"
              defaultValue={translation?.translationStatus ?? 'DRAFT'}
              className={fieldInputClasses}
            >
              <option value="DRAFT">草稿（前台不可见）</option>
              <option value="PUBLISHED">已发布（前台可见）</option>
            </select>
          </FormField>

          {esState.message && (
            <p className={`text-sm ${esState.success ? 'text-green-600' : 'text-red-600'}`}>{esState.message}</p>
          )}

          <button
            type="submit"
            disabled={esPending}
            className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60"
          >
            {esPending ? '保存中...' : '保存西班牙语'}
          </button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
