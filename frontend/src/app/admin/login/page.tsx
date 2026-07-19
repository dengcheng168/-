import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: '管理员登录',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-grey-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-grey-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-navy-950">后台管理登录</h1>
        <p className="mt-1 text-center text-sm text-grey-500">净水器工厂官网管理系统</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
