'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import type { AdminFormState } from '@/lib/actions/admin/categories';

interface FormValues {
  question?: string;
  answer?: string;
  category?: string | null;
  published?: boolean;
}

export function FaqForm({
  action,
  initialValues,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues?: FormValues;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormField label="问题" htmlFor="question" required>
        <input id="question" name="question" defaultValue={initialValues?.question} required className={fieldInputClasses} />
      </FormField>

      <FormField label="答案" htmlFor="answer" required>
        <textarea id="answer" name="answer" rows={4} defaultValue={initialValues?.answer} required className={fieldInputClasses} />
      </FormField>

      <FormField label="分类（可选）" htmlFor="category">
        <input id="category" name="category" defaultValue={initialValues?.category ?? ''} className={fieldInputClasses} />
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
