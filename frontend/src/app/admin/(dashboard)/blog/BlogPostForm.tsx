'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import type { AdminFormState } from '@/lib/actions/admin/categories';

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

export function BlogPostForm({
  action,
  categories,
  tags,
  initialValues,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  categories: CategoryOption[];
  tags: TagOption[];
  initialValues?: FormValues;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const selectedTagIds = new Set((initialValues?.tags ?? []).map((t) => t.id));

  return (
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
}
