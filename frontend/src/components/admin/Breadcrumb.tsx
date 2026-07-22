import { IconChevronRight } from './icons';

export function Breadcrumb({ group, label }: { group: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span>{group}</span>
      <IconChevronRight className="h-3.5 w-3.5" />
      <span className="font-medium text-foreground">{label}</span>
    </div>
  );
}
