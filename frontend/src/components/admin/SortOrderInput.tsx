'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/admin/ui/input';

interface SortOrderResult {
  success?: boolean;
  message?: string;
}

interface SortOrderInputProps {
  id: number;
  defaultValue: number;
  action: (id: number, sortOrder: number) => Promise<SortOrderResult>;
}

// 数字越小越靠前排在前面，和后端 `orderBy: { sortOrder: 'asc' }` 保持一致。
export function SortOrderInput({ id, defaultValue, action }: SortOrderInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(String(defaultValue));
  const [pending, startTransition] = useTransition();

  function commit() {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
      setValue(String(defaultValue));
      return;
    }
    if (parsed === defaultValue) return;

    startTransition(async () => {
      const result = await action(id, parsed);
      if (result.success === false) {
        toast.error(result.message ?? '排序更新失败');
        setValue(String(defaultValue));
      } else {
        toast.success('排序已更新');
        router.refresh();
      }
    });
  }

  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      disabled={pending}
      className="w-16"
    />
  );
}
