export const fieldInputClasses =
  'w-full rounded-md border border-grey-200 px-3 py-2 text-sm text-navy-950 focus:border-water-500 focus:outline-none focus:ring-1 focus:ring-water-500';

export function FormField({
  label,
  htmlFor,
  required,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-navy-950">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-grey-500">{hint}</p>}
    </div>
  );
}
