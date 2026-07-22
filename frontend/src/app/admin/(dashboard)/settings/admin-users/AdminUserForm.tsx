'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import type { AdminFormState } from '@/lib/actions/admin/categories';

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: '超级管理员' },
  { value: 'CONTENT_ADMIN', label: '内容管理员' },
  { value: 'SALES', label: '销售人员' },
];

interface FormValues {
  email?: string;
  name?: string | null;
  role?: string;
  isActive?: boolean;
}

export function AdminUserForm({
  action,
  initialValues,
  mode,
  disableSelfDeactivate,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues?: FormValues;
  mode: 'create' | 'edit';
  /** 编辑自己账号时不允许在这个表单里把自己停用 */
  disableSelfDeactivate?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormField label="邮箱" htmlFor="email" required>
        <input id="email" name="email" type="email" required defaultValue={initialValues?.email} className={fieldInputClasses} />
      </FormField>

      <FormField label="姓名" htmlFor="name">
        <input id="name" name="name" defaultValue={initialValues?.name ?? ''} className={fieldInputClasses} />
      </FormField>

      {mode === 'create' && (
        <FormField label="初始密码" htmlFor="password" required hint="至少 8 位，管理员登录后可以自行修改">
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className={fieldInputClasses} />
        </FormField>
      )}

      <FormField label="角色" htmlFor="role" required>
        <select id="role" name="role" required defaultValue={initialValues?.role ?? 'CONTENT_ADMIN'} className={fieldInputClasses}>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormField>

      {mode === 'edit' && (
        <label className={`flex items-center gap-2 text-sm text-foreground ${disableSelfDeactivate ? 'opacity-50' : ''}`}>
          <input type="checkbox" name="isActive" defaultChecked={initialValues?.isActive ?? true} disabled={disableSelfDeactivate} />
          启用该账号
          {disableSelfDeactivate && <span className="text-xs text-muted-foreground">（不能停用当前登录的账号本身）</span>}
        </label>
      )}

      {state.message && <p className={`text-sm ${state.success ? 'text-emerald-600' : 'text-destructive'}`}>{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? '保存中...' : mode === 'create' ? '创建管理员' : '保存修改'}
      </button>
    </form>
  );
}
