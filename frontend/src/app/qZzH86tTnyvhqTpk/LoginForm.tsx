'use client';

import { useActionState } from 'react';
import { loginAction, type LoginFormState } from '@/lib/actions/auth';

const initialState: LoginFormState = {};

const inputClasses =
  'w-full rounded-md border border-grey-200 px-3 py-2 text-sm text-navy-950 focus:border-water-500 focus:outline-none focus:ring-1 focus:ring-water-500';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-950">
          邮箱
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy-950">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClasses}
        />
      </div>

      {state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-water-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-water-600 disabled:opacity-60"
      >
        {pending ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
