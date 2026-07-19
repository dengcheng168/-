'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createRedirectAction } from '@/lib/actions/admin/redirects';
import { fieldInputClasses } from '@/components/admin/FormField';

export function NewRedirectForm() {
  const [state, formAction, pending] = useActionState(createRedirectAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-navy-950">来源路径</label>
        <input name="fromPath" required placeholder="/old-page" className={fieldInputClasses} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-navy-950">目标路径</label>
        <input name="toPath" required placeholder="/new-page" className={fieldInputClasses} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-navy-950">状态码</label>
        <select name="statusCode" defaultValue="301" className={fieldInputClasses}>
          <option value="301">301 永久</option>
          <option value="302">302 临时</option>
        </select>
      </div>
      <button type="submit" disabled={pending} className="rounded-md bg-water-500 px-4 py-2 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60">
        {pending ? '添加中...' : '添加'}
      </button>
      {state.message && <p className="text-sm text-red-600">{state.message}</p>}
    </form>
  );
}
