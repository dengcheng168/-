'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import type { AdminFormState } from '@/lib/actions/admin/categories';

interface FormValues {
  label?: string;
  url?: string;
  sortOrder?: number;
  visible?: boolean;
  openInNewTab?: boolean;
}

export function NavItemForm({
  action,
  initialValues,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues?: FormValues;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <FormField label="菜单名称" htmlFor="label" required>
        <input id="label" name="label" defaultValue={initialValues?.label} required className={fieldInputClasses} />
      </FormField>
      <FormField label="链接地址" htmlFor="url" required hint="例如 /products 或 https://...">
        <input id="url" name="url" defaultValue={initialValues?.url} required className={fieldInputClasses} />
      </FormField>
      <FormField label="排序" htmlFor="sortOrder">
        <input id="sortOrder" name="sortOrder" type="number" defaultValue={initialValues?.sortOrder ?? 0} className={fieldInputClasses} />
      </FormField>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-navy-950">
          <input type="checkbox" name="visible" defaultChecked={initialValues?.visible ?? true} /> 显示
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-950">
          <input type="checkbox" name="openInNewTab" defaultChecked={initialValues?.openInNewTab} /> 新窗口打开
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
