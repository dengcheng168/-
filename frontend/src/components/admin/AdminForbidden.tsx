import Link from 'next/link';
import { Button } from '@/components/admin/ui/button';

export function AdminForbidden({ message = '你没有权限查看这个页面。' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">403</p>
      <h1 className="mt-2 text-xl font-semibold text-foreground">权限不足</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <Link href="/admin">返回工作台</Link>
      </Button>
    </div>
  );
}
