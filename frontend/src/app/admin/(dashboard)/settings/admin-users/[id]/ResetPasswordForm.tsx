'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { resetAdminUserPasswordAction } from '@/lib/actions/admin/admin-users';

export function ResetPasswordForm({ id }: { id: number }) {
  const boundAction = resetAdminUserPasswordAction.bind(null, id);
  const [state, formAction, pending] = useActionState(boundAction, {});

  return (
    <form action={formAction} className="max-w-md space-y-3">
      <FormField label="新密码" htmlFor="newPassword" required hint="至少 8 位，重置后该管理员现有的登录状态会立刻全部失效">
        <input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" className={fieldInputClasses} />
      </FormField>
      {state.message && <p className={`text-sm ${state.success ? 'text-emerald-600' : 'text-destructive'}`}>{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
      >
        {pending ? '重置中...' : '重置密码'}
      </button>
    </form>
  );
}
