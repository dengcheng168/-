'use client';

import { useActionState, useRef, useEffect } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { changePasswordAction } from '@/lib/actions/admin/settings';

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="max-w-xl space-y-4">
      <FormField label="当前密码" htmlFor="currentPassword" required>
        <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className={fieldInputClasses} />
      </FormField>
      <FormField label="新密码" htmlFor="newPassword" required hint="至少 8 位">
        <input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" className={fieldInputClasses} />
      </FormField>
      <FormField label="确认新密码" htmlFor="confirmPassword" required>
        <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className={fieldInputClasses} />
      </FormField>

      {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60">
        {pending ? '修改中...' : '修改密码'}
      </button>
    </form>
  );
}
