export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={`mx-auto max-w-2xl ${align === 'center' ? 'text-center' : 'text-left'}`}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-water-600">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-2xl font-semibold text-navy-950 sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-grey-500">{description}</p>}
    </div>
  );
}
