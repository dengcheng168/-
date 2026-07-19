'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import type { AdminFormState } from '@/lib/actions/admin/categories';

interface FormValues {
  name?: string;
  description?: string | null;
  published?: boolean;
}

export function BlogCategoryForm({
  action,
  initialValues,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues?: FormValues;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormField label="分类名称" htmlFor="name" required>
        <input id="name" name="name" defaultValue={initialValues?.name} required className={fieldInputClasses} />
      </FormField>

      <FormField label="分类描述" htmlFor="description">
        <textarea id="description" name="description" rows={3} defaultValue={initialValues?.description ?? ''} className={fieldInputClasses} />
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
