'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function MediaDeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      const usageRes = await fetch(`/auth/admin/proxy/media/${id}/usage`);
      const usageBody = await usageRes.json();

      if (usageBody?.data?.inUse) {
        const names = usageBody.data.usages.map((u: { name: string }) => u.name).join('、');
        window.alert(`该媒体文件仍被以下内容使用，无法删除：${names}`);
        return;
      }

      if (!window.confirm('确定要删除这张图片吗？')) return;

      const deleteRes = await fetch(`/auth/admin/proxy/media/${id}`, { method: 'DELETE' });
      if (!deleteRes.ok) {
        const body = await deleteRes.json().catch(() => null);
        window.alert(body?.error?.message ?? `删除失败（HTTP ${deleteRes.status}）`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={handleDelete} disabled={busy} className="text-xs text-red-600 hover:underline disabled:opacity-50">
      删除
    </button>
  );
}
