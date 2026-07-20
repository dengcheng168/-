'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/admin/ui/button';
import { clearSiteCacheAction } from '@/lib/actions/admin/cache';

export function CacheActions() {
  const [pending, startTransition] = useTransition();

  function handleClear() {
    if (!window.confirm('确定要清除全站缓存吗？清除后前台页面会在下次访问时重新生成，短时间内访问可能会略慢。')) return;
    startTransition(async () => {
      const result = await clearSiteCacheAction();
      if (result.success) {
        toast.success(result.message ?? '已清除');
      } else {
        toast.error(result.message ?? '操作失败');
      }
    });
  }

  return (
    <Button type="button" variant="outline" onClick={handleClear} disabled={pending}>
      清除全站缓存
    </Button>
  );
}
