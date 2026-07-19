'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import type { AdminFormState } from '@/lib/actions/admin/categories';

interface FormValues {
  authorName?: string;
  authorTitle?: string | null;
  companyName?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  quote?: string;
  rating?: number | null;
  published?: boolean;
}

export function TestimonialForm({
  action,
  initialValues,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues?: FormValues;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="姓名" htmlFor="authorName" required>
          <input id="authorName" name="authorName" defaultValue={initialValues?.authorName} required className={fieldInputClasses} />
        </FormField>
        <FormField label="职位" htmlFor="authorTitle">
          <input id="authorTitle" name="authorTitle" defaultValue={initialValues?.authorTitle ?? ''} className={fieldInputClasses} />
        </FormField>
        <FormField label="公司" htmlFor="companyName">
          <input id="companyName" name="companyName" defaultValue={initialValues?.companyName ?? ''} className={fieldInputClasses} />
        </FormField>
        <FormField label="国家/地区" htmlFor="country">
          <input id="country" name="country" defaultValue={initialValues?.country ?? ''} className={fieldInputClasses} />
        </FormField>
      </div>

      <ImageUploader name="avatarUrl" label="头像（可选）" defaultValue={initialValues?.avatarUrl} />

      <FormField label="评价内容" htmlFor="quote" required>
        <textarea id="quote" name="quote" rows={4} defaultValue={initialValues?.quote} required className={fieldInputClasses} />
      </FormField>

      <FormField label="评分（1-5，可选）" htmlFor="rating">
        <input id="rating" name="rating" type="number" min={1} max={5} defaultValue={initialValues?.rating ?? ''} className={fieldInputClasses} />
      </FormField>

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
}
