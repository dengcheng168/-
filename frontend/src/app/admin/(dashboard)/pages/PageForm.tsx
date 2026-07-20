'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import type { AdminFormState } from '@/lib/actions/admin/categories';

interface FormValues {
  title?: string;
  bodyHtml?: string | null;
  sections?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  heroImage?: string | null;
}

export function PageForm({
  action,
  initialValues,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues?: FormValues;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const sectionsJson = initialValues?.sections != null ? JSON.stringify(initialValues.sections, null, 2) : '';

  return (
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
}
