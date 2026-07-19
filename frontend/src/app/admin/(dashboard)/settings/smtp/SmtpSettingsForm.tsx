'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { updateSmtpSettingsAction, testSmtpAction } from '@/lib/actions/admin/settings';

interface Values {
  smtpEnabled: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpFromEmail: string | null;
}

export function SmtpSettingsForm({ initialValues }: { initialValues: Values }) {
  const [state, formAction, pending] = useActionState(updateSmtpSettingsAction, {});
  const [testState, testAction, testPending] = useActionState(testSmtpAction, {});

  return (
    <div className="max-w-xl space-y-8">
      <form action={formAction} className="space-y-4">
        <label className="flex items-center gap-2 text-sm text-navy-950">
          <input type="checkbox" name="smtpEnabled" defaultChecked={initialValues.smtpEnabled} /> 启用邮件提醒
        </label>
        <FormField label="SMTP 服务器地址" htmlFor="smtpHost">
          <input id="smtpHost" name="smtpHost" defaultValue={initialValues.smtpHost ?? ''} className={fieldInputClasses} />
        </FormField>
        <FormField label="端口" htmlFor="smtpPort">
          <input id="smtpPort" name="smtpPort" type="number" defaultValue={initialValues.smtpPort ?? ''} className={fieldInputClasses} />
        </FormField>
        <FormField label="用户名" htmlFor="smtpUser">
          <input id="smtpUser" name="smtpUser" defaultValue={initialValues.smtpUser ?? ''} className={fieldInputClasses} />
        </FormField>
        <FormField label="密码 / 授权码" htmlFor="smtpPassword" hint="留空表示不修改">
          <input id="smtpPassword" name="smtpPassword" type="password" className={fieldInputClasses} />
        </FormField>
        <FormField label="发件人邮箱" htmlFor="smtpFromEmail">
          <input id="smtpFromEmail" name="smtpFromEmail" defaultValue={initialValues.smtpFromEmail ?? ''} className={fieldInputClasses} />
        </FormField>

        {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        <button type="submit" disabled={pending} className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60">
          {pending ? '保存中...' : '保存'}
        </button>
      </form>

      <form action={testAction} className="border-t border-grey-200 pt-6">
        <button type="submit" disabled={testPending} className="rounded-md border border-grey-200 bg-white px-4 py-2 text-sm text-navy-950 hover:bg-grey-50 disabled:opacity-60">
          {testPending ? '测试中...' : '测试 SMTP 连接'}
        </button>
        {testState.message && <p className={`mt-2 text-sm ${testState.success ? 'text-green-600' : 'text-red-600'}`}>{testState.message}</p>}
      </form>
    </div>
  );
}
