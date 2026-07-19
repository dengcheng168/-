import { IconChevronRight } from './icons';

export function Breadcrumb({ group, label }: { group: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
      <span>{group}</span>
      <IconChevronRight className="h-3.5 w-3.5" />
      <span className="font-medium text-[#111827]">{label}</span>
    </div>
  );
}
