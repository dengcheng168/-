import Link from 'next/link';
import { Button } from '@/components/admin/ui/button';

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-xl font-semibold text-foreground">页面不存在</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">这个后台地址没有对应的页面，可能是链接有误或功能尚未上线。</p>
      <Button asChild className="mt-6">
        <Link href="/admin">返回工作台</Link>
      </Button>
    </div>
  );
}
