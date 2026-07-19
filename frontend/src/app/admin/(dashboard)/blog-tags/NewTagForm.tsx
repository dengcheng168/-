'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createBlogTagAction } from '@/lib/actions/admin/blog-tags';
import { fieldInputClasses } from '@/components/admin/FormField';
import { IconPlus } from '@/components/admin/icons';

export function NewTagForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createBlogTagAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  // 渲染期间同步"提交成功后收起弹窗"，避免在 effect 里直接 setState
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setOpen(false);
  }

  // 表单 DOM reset 是命令式操作，不是 setState，留在 effect 里没问题
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md bg-[#0a2540] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d3059]"
      >
        <IconPlus className="h-4 w-4" />
        新建标签
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-lg">
            <form ref={formRef} action={formAction} className="space-y-3">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#111827]">
                  标签名称
                </label>
                <input id="name" name="name" required autoFocus className={fieldInputClasses} />
              </div>
              {state.message && <p className="text-sm text-red-600">{state.message}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-1.5 text-sm text-[#6B7280] hover:bg-[#F6F7F9]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-[#0a2540] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0d3059] disabled:opacity-60"
                >
                  {pending ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
