'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { updateWhatsappSettingsAction } from '@/lib/actions/admin/settings';

interface Values {
  whatsappNumber: string | null;
  whatsappLink: string | null;
}

export function WhatsappSettingsForm({ initialValues }: { initialValues: Values }) {
  const [state, formAction, pending] = useActionState(updateWhatsappSettingsAction, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormField label="WhatsApp 号码" htmlFor="whatsappNumber" hint="含国家区号，如 +86 138 0000 0000">
        <input id="whatsappNumber" name="whatsappNumber" defaultValue={initialValues.whatsappNumber ?? ''} className={fieldInputClasses} />
      </FormField>
      <FormField label="WhatsApp 链接（可选）" htmlFor="whatsappLink" hint="留空则自动根据号码生成 wa.me 链接">
        <input id="whatsappLink" name="whatsappLink" defaultValue={initialValues.whatsappLink ?? ''} className={fieldInputClasses} />
      </FormField>

      {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60">
        {pending ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
