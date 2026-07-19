'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createBlogTagAction } from '@/lib/actions/admin/blog-tags';
import { fieldInputClasses } from '@/components/admin/FormField';

export function NewTagForm() {
  const [state, formAction, pending] = useActionState(createBlogTagAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-3">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy-950">
          新标签名称
        </label>
        <input id="name" name="name" required className={fieldInputClasses} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-water-500 px-4 py-2 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60"
      >
        {pending ? '添加中...' : '添加'}
      </button>
      {state.message && <p className="text-sm text-red-600">{state.message}</p>}
    </form>
  );
}
