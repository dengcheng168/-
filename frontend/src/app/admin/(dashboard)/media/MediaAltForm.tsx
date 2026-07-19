'use client';

import { useActionState } from 'react';
import { updateMediaAltAction } from '@/lib/actions/admin/media';

export function MediaAltForm({ id, altText }: { id: number; altText: string | null }) {
  const boundAction = updateMediaAltAction.bind(null, id);
  const [state, formAction, pending] = useActionState(boundAction, {});

  return (
    <form action={formAction} className="mt-2 flex gap-1">
      <input
        name="altText"
        defaultValue={altText ?? ''}
        placeholder="Alt 文本"
        className="w-full rounded border border-grey-200 px-2 py-1 text-xs"
      />
      <button type="submit" disabled={pending} className="shrink-0 rounded bg-grey-100 px-2 py-1 text-xs text-grey-700 hover:bg-grey-200">
        {pending ? '...' : '保存'}
      </button>
      {state.message && <span className="sr-only">{state.message}</span>}
    </form>
  );
}
