import type { ReactNode } from 'react';
import { IconInboxEmpty } from './icons';

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F6F7F9] text-[#6B7280]">
        {icon ?? <IconInboxEmpty className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[#111827]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-[#6B7280]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
