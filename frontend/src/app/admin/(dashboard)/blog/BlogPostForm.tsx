'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { TranslationMeta } from '@/components/admin/TranslationMeta';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/admin/ui/tabs';
import type { AdminFormState } from '@/lib/actions/admin/categories';
import type { TranslationFormState } from '@/lib/actions/admin/translations-shared';

interface CategoryOption {
  id: number;
  name: string;
}

interface TagOption {
  id: number;
  name: string;
}

interface FormValues {
  title?: string;
  excerpt?: string | null;
  body?: string;
  coverImage?: string | null;
  categoryId?: number;
  authorName?: string;
  status?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  tags?: { id: number }[];
}

interface TranslationValues {
  title?: string | null;
  excerpt?: string | null;
  body?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  translationStatus?: string;
  updatedAt?: string;
  updatedBy?: number | null;
}

export function BlogPostForm({
  action,
  categories,
  tags,
  initialValues,
  translationAction,
  translation,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  categories: CategoryOption[];
  tags: TagOption[];
  initialValues?: FormValues;
  translationAction?: (prevState: TranslationFormState, formData: FormData) => Promise<TranslationFormState>;
  translation?: TranslationValues | null;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [esState, esFormAction, esPending] = useActionState(translationAction ?? action, {});
  const selectedTagIds = new Set((initialValues?.tags ?? []).map((t) => t.id));

  const englishForm = (
    <form action={formAction} className="max-w-3xl space-y-4">
      <FormField label="标题" htmlFor="title" required>
        <input id="title" name="title" defaultValue={initialValues?.title} required className={fieldInputClasses} />
      </FormField>

      <FormField label="摘要" htmlFor="excerpt">
        <input id="excerpt" name="excerpt" defaultValue={initialValues?.excerpt ?? ''} className={fieldInputClasses} />
      </FormField>

      <ImageUploader
        name="coverImage"
        label="封面图"
        defaultValue={initialValues?.coverImage}
        recommendedSize="建议 1200×675px（16:9）"
        aspectRatio={16 / 9}
      />

      <FormField label="正文（HTML）" htmlFor="body" required hint="支持 HTML 标签，如 <h2> <p> <ul><li>">
        <textarea id="body" name="body" rows={10} defaultValue={initialValues?.body} required className={fieldInputClasses} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="分类" htmlFor="categoryId" required>
          <select id="categoryId" name="categoryId" defaultValue={initialValues?.categoryId} required className={fieldInputClasses}>
            <option value="">请选择分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="作者" htmlFor="authorName">
          <input id="authorName" name="authorName" defaultValue={initialValues?.authorName ?? 'Admin'} className={fieldInputClasses} />
        </FormField>
      </div>

      {tags.length > 0 && (
        <FormField label="标签" htmlFor="tagIds">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1.5 text-sm text-navy-950">
                <input type="checkbox" name="tagIds" value={tag.id} defaultChecked={selectedTagIds.has(tag.id)} />
                {tag.name}
              </label>
            ))}
          </div>
        </FormField>
      )}

      <FormField label="发布状态" htmlFor="status">
        <select id="status" name="status" defaultValue={initialValues?.status ?? 'DRAFT'} className={fieldInputClasses}>
          <option value="DRAFT">草稿</option>
          <option value="PUBLISHED">已发布</option>
        </select>
      </FormField>

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

          <p className="text-xs text-muted-foreground">封面图/分类/作者/标签/发布状态为共用字段，请在 English 标签页维护。</p>

          <FormField label="标题（西班牙语）" htmlFor="es_title" hint={`英文原文：${initialValues?.title ?? ''}`}>
            <input id="es_title" name="title" defaultValue={translation?.title ?? ''} className={fieldInputClasses} />
          </FormField>

          <FormField label="摘要（西班牙语）" htmlFor="es_excerpt" hint={`英文原文：${initialValues?.excerpt ?? ''}`}>
            <input id="es_excerpt" name="excerpt" defaultValue={translation?.excerpt ?? ''} className={fieldInputClasses} />
          </FormField>

          <FormField label="正文（西班牙语 HTML）" htmlFor="es_body" hint="支持 HTML 标签；留空则前台自动显示英文原文">
            <textarea id="es_body" name="body" rows={10} defaultValue={translation?.body ?? ''} className={fieldInputClasses} />
          </FormField>
          {initialValues?.body && (
            <details className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <summary className="cursor-pointer font-medium text-muted-foreground">查看英文原文（正文）</summary>
              <div className="prose prose-sm mt-2 max-w-none" dangerouslySetInnerHTML={{ __html: initialValues.body }} />
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
