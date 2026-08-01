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
  imageUrl?: string | null;
  description?: string | null;
  published?: boolean;
}

interface TranslationValues {
  title?: string | null;
  description?: string | null;
  translationStatus?: string;
  updatedAt?: string;
  updatedBy?: number | null;
}

export function FactoryGalleryItemForm({
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

  const englishForm = (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormField label="标题" htmlFor="title" required>
        <input id="title" name="title" defaultValue={initialValues?.title} required className={fieldInputClasses} />
      </FormField>

      <ImageUploader
        name="imageUrl"
        label="展示图片"
        defaultValue={initialValues?.imageUrl}
        recommendedSize="建议 900×600px（3:2 横版），不设置则显示占位图"
        aspectRatio={3 / 2}
      />

      <FormField label="描述" htmlFor="description">
        <textarea id="description" name="description" rows={3} defaultValue={initialValues?.description ?? ''} className={fieldInputClasses} />
      </FormField>

      <div className="flex items-center gap-2">
        <input id="published" name="published" type="checkbox" defaultChecked={initialValues?.published ?? true} />
        <label htmlFor="published" className="text-sm text-navy-950">
          发布（前台可见）
        </label>
      </div>

      {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}

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

          <p className="text-xs text-muted-foreground">展示图片为共用字段，不分语言，请在 English 标签页维护。</p>

          <FormField label="标题（西班牙语）" htmlFor="es_title" hint={`英文原文：${initialValues?.title ?? ''}`}>
            <input id="es_title" name="title" defaultValue={translation?.title ?? ''} className={fieldInputClasses} />
          </FormField>

          <FormField label="描述（西班牙语）" htmlFor="es_description" hint={`英文原文：${initialValues?.description ?? ''}`}>
            <textarea id="es_description" name="description" rows={3} defaultValue={translation?.description ?? ''} className={fieldInputClasses} />
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
