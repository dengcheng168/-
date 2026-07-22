'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { TranslationMeta } from '@/components/admin/TranslationMeta';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/admin/ui/tabs';
import type { AdminFormState } from '@/lib/actions/admin/categories';
import type { TranslationFormState } from '@/lib/actions/admin/translations-shared';

interface CategoryFormValues {
  name?: string;
  description?: string | null;
  image?: string | null;
  published?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

interface TranslationValues {
  name?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  translationStatus?: string;
  updatedAt?: string;
  updatedBy?: number | null;
}

export function CategoryForm({
  action,
  initialValues,
  translationAction,
  translation,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues?: CategoryFormValues;
  translationAction?: (prevState: TranslationFormState, formData: FormData) => Promise<TranslationFormState>;
  translation?: TranslationValues | null;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [esState, esFormAction, esPending] = useActionState(translationAction ?? action, {});

  const englishForm = (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormField label="分类名称" htmlFor="name" required>
        <input id="name" name="name" defaultValue={initialValues?.name} required className={fieldInputClasses} />
      </FormField>

      <FormField label="分类描述" htmlFor="description">
        <textarea id="description" name="description" rows={3} defaultValue={initialValues?.description ?? ''} className={fieldInputClasses} />
      </FormField>

      <ImageUploader
        name="image"
        label="分类图片"
        defaultValue={initialValues?.image}
        recommendedSize="建议 800×600px"
        aspectRatio={4 / 3}
      />

      <div className="flex items-center gap-2">
        <input id="published" name="published" type="checkbox" defaultChecked={initialValues?.published ?? true} />
        <label htmlFor="published" className="text-sm text-navy-950">
          发布（前台可见）
        </label>
      </div>

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
        <form action={esFormAction} className="max-w-xl space-y-4">
          <TranslationMeta
            translationStatus={translation?.translationStatus}
            updatedAt={translation?.updatedAt}
            updatedBy={translation?.updatedBy}
          />

          <FormField label="分类名称（西班牙语）" htmlFor="es_name" hint={`英文原文：${initialValues?.name ?? ''}`}>
            <input id="es_name" name="name" defaultValue={translation?.name ?? ''} className={fieldInputClasses} />
          </FormField>

          <FormField
            label="分类描述（西班牙语）"
            htmlFor="es_description"
            hint={`英文原文：${initialValues?.description ?? ''}`}
          >
            <textarea id="es_description" name="description" rows={3} defaultValue={translation?.description ?? ''} className={fieldInputClasses} />
          </FormField>

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
