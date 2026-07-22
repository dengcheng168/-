'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/admin/ui/button';
import { unlockAdminUserAction, revokeAdminUserSessionsAction } from '@/lib/actions/admin/admin-users';

export function AdminUserActions({ id, locked }: { id: number; locked: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleUnlock() {
    if (!window.confirm('确定要手动解除这个账号的登录锁定吗？')) return;
    startTransition(async () => {
      const result = await unlockAdminUserAction(id);
      if (result.success) {
        toast.success(result.message ?? '已解锁');
        router.refresh();
      } else {
        toast.error(result.message ?? '操作失败');
      }
    });
  }

  function handleRevoke() {
    if (!window.confirm('确定要强制这个账号的所有登录状态失效吗？该管理员会立刻需要重新登录。')) return;
    startTransition(async () => {
      const result = await revokeAdminUserSessionsAction(id);
      if (result.success) {
        toast.success(result.message ?? '已强制下线');
      } else {
        toast.error(result.message ?? '操作失败');
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={handleUnlock} disabled={pending || !locked}>
        手动解除锁定
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handleRevoke} disabled={pending}>
        强制下线（使已有登录失效）
      </Button>
    </div>
  );
}
