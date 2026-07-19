'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { updateFooterSettingsAction } from '@/lib/actions/admin/settings';

interface Values {
  footerText: string | null;
}

export function FooterForm({ initialValues }: { initialValues: Values }) {
  const [state, formAction, pending] = useActionState(updateFooterSettingsAction, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormField label="页脚版权文字" htmlFor="footerText" hint="留空则自动显示 © 年份 公司名称">
        <input id="footerText" name="footerText" defaultValue={initialValues.footerText ?? ''} className={fieldInputClasses} />
      </FormField>

      {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60">
        {pending ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
